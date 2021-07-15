import {Options} from 'amqplib';
import {MethodDecoratorFactory} from '@loopback/core';

export interface RabbitMQSubscribeMetadata {
  exchange: string;
  routingKey: string | string[];
  queue?: string;
  queueOptions?: Options.AssertQueue;
}

export const RABBITMQ_SUBSCRIBE_DECORATOR = 'rabbitmq-subscribe-metadata';

export function rabbitmqSubscribe(
  spec: RabbitMQSubscribeMetadata,
): MethodDecorator {
  return MethodDecoratorFactory.createDecorator<RabbitMQSubscribeMetadata>(
    RABBITMQ_SUBSCRIBE_DECORATOR,
    spec,
  );
}
