import {
  Application,
  Binding,
  Context,
  CoreBindings,
  inject,
  MetadataInspector,
  Server,
} from '@loopback/core';
import {repository} from '@loopback/repository';
import {CategoryRepository} from '../repositories';
import {RabbitMQBindings} from '../keys';
import {
  AmqpConnectionManager,
  AmqpConnectionManagerOptions,
  ChannelWrapper,
  connect,
} from 'amqp-connection-manager';
import {Channel, ConfirmChannel, Message, Options} from 'amqplib';
import {
  RABBITMQ_SUBSCRIBE_DECORATOR,
  RabbitMQSubscribeMetadata,
} from '../decorators';

interface RabbitMQExchange {
  name: string;
  type: string;
  options?: Options.AssertExchange;
}

interface RabbitMQQueue {
  name: string;
  exchange?: {name: string; routingKey: string};
  options?: Options.AssertQueue;
}

export interface RabbitMQConfig {
  uri: string;
  connOptions?: AmqpConnectionManagerOptions;
  exchanges?: RabbitMQExchange[];
  queues?: RabbitMQQueue[];
  defaultHandlerError?: ResponseEnum;
}

export interface RabbitMQPayload {
  data: any;
  message: Message;
  channel: ConfirmChannel;
}

export enum ResponseEnum {
  ACK,
  REQUEUE,
  NACK,
}

export class RabbitMQServer extends Context implements Server {
  private _listening: boolean;
  private _conn: AmqpConnectionManager;
  private _channelManager: ChannelWrapper;
  private _maxAttemptCount = 3;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    app: Application,

    @repository(CategoryRepository)
    private categoryRepo: CategoryRepository,

    @inject(RabbitMQBindings.CONFIG)
    private config: RabbitMQConfig,
  ) {
    super(app);
  }

  async start(): Promise<void> {
    this._conn = connect([this.config.uri], this.config.connOptions);
    this._channelManager = this.conn.createChannel();
    this._channelManager.on('connect', () => {
      this._listening = true;
      console.log('Successfully connected a RabbitMQ channel.');
    });
    this._channelManager.on('error', (err, {name}) => {
      this._listening = false;
      console.log(
        `Failed to setup RabbitMQ channel: ${name}, error: ${err.message}`,
      );
    });
    await this.setupExchanges();
    await this.setupQueues();
    await this.bindSubscribers();
  }

  async stop(): Promise<void> {
    await this.conn.close();
    this._listening = false;
  }

  private async setupExchanges() {
    return this.channelManager.addSetup(async (channel: ConfirmChannel) => {
      if (!this.config.exchanges) {
        return;
      }

      await Promise.all(
        this.config.exchanges.map(exchange => {
          return channel.assertExchange(
            exchange.name,
            exchange.type,
            exchange.options,
          );
        }),
      );
    });
  }

  private async setupQueues() {
    return this.channelManager.addSetup(async (channel: ConfirmChannel) => {
      if (!this.config.queues) {
        return;
      }

      await Promise.all(
        this.config.queues.map(async queue => {
          await channel.assertQueue(queue.name, queue.options);

          if (!queue.exchange) {
            return;
          }

          await channel.bindQueue(
            queue.name,
            queue.exchange.name,
            queue.exchange.routingKey,
          );
        }),
      );
    });
  }

  private async bindSubscribers() {
    this.getSubscribers().map(async item => {
      await this.channelManager.addSetup(async (channel: ConfirmChannel) => {
        const {exchange, routingKey, queue, queueOptions} = item.metadata;

        const assertQueue = await channel.assertQueue(
          queue ?? '',
          queueOptions ?? undefined,
        );

        const routingKeys = Array.isArray(routingKey)
          ? routingKey
          : [routingKey];
        await Promise.all(
          routingKeys.map(key =>
            channel.bindQueue(assertQueue.queue, exchange, key),
          ),
        );

        await this.consume(channel, assertQueue.queue, item.method);
      });
    });
  }

  private getSubscribers(): {
    method: Function;
    metadata: RabbitMQSubscribeMetadata;
  }[] {
    const bindings: Array<Readonly<Binding>> = this.find('services.*');
    return bindings
      .map(binding => {
        const metadata =
          MetadataInspector.getAllMethodMetadata<RabbitMQSubscribeMetadata>(
            RABBITMQ_SUBSCRIBE_DECORATOR,
            binding.valueConstructor?.prototype,
          );

        if (!metadata) {
          return [];
        }

        const methods = [];
        for (const methodName in metadata) {
          if (!Object.prototype.hasOwnProperty.call(metadata, methodName)) {
            return;
          }
          const service = this.getSync(binding.key) as any;
          methods.push({
            method: service[methodName].bind(service),
            metadata: metadata[methodName],
          });
        }

        return methods;
      })
      .reduce((collection: any, item: any) => {
        collection.push(...item);
        return collection;
      }, []);
  }

  private async consume(
    channel: ConfirmChannel,
    queue: string,
    method: Function,
  ) {
    await channel.consume(queue, async message => {
      try {
        if (!message) {
          throw new Error('Received null message');
        }

        const content = message.content;
        if (content) {
          let data;
          try {
            data = JSON.parse(content.toString());
          } catch (error) {
            data = null;
          }
          console.log(data);

          const payload: RabbitMQPayload = {data, message, channel};
          const responseType = await method(payload);
          this.dispatchResponse(channel, message, responseType);
        }
      } catch (error) {
        console.error(error, {
          routingKey: message?.fields.routingKey,
          content: message?.content.toString(),
        });
        if (!message) {
          return;
        }
        this.dispatchResponse(
          channel,
          message,
          this.config.defaultHandlerError,
        );
      }
    });
  }

  private dispatchResponse(
    channel: Channel,
    message: Message,
    responseType?: ResponseEnum,
  ) {
    switch (responseType) {
      case ResponseEnum.REQUEUE:
        channel.nack(message, false, true);
        break;
      case ResponseEnum.NACK:
        this.handleNack(channel, message);
        break;
      case ResponseEnum.ACK:
      default:
        channel.ack(message);
    }
  }

  private handleNack(channel: Channel, message: Message) {
    const canDeadLetter = this.canDeadLetter(channel, message);
    if (canDeadLetter) {
      console.log('Nack in message', {content: message.content.toString()});
      channel.nack(message, false, false);
    } else {
      channel.ack(message);
    }
  }

  private canDeadLetter(channel: Channel, message: Message) {
    if (message.properties.headers && 'x-death' in message.properties.headers) {
      const count = message.properties.headers['x-death']![0].count;
      const queue = message.properties.headers['x-death']![0].queue;
      if (count >= this._maxAttemptCount) {
        channel.ack(message);
        console.error(
          `Ack in ${queue} with error. Max attempts exceeded ${this._maxAttemptCount}.`,
        );
        return false;
      }
    }
    return true;
  }

  get listening(): boolean {
    return this._listening;
  }

  get conn(): AmqpConnectionManager {
    return this._conn;
  }

  get channelManager(): ChannelWrapper {
    return this._channelManager;
  }
}
