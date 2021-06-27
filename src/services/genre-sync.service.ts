import {bind, BindingScope} from '@loopback/core';
import {rabbitmqSubscribe} from "../decorators";
import {RabbitMQPayload} from "../servers";
import { repository } from '@loopback/repository';
import { GenreRepository } from '../repositories';
import {BaseModelSyncService} from "./base-model-sync.service";

@bind({scope: BindingScope.SINGLETON})
export class GenreSyncService extends BaseModelSyncService {

  constructor(
    @repository(GenreRepository)
    private repository: GenreRepository
  ) {
    super();
  }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-videos/genre',
    routingKey: 'model.genre.*'
  })
  async handler({data, message}: RabbitMQPayload) {
    await this.sync({
      repo: this.repository,
      data,
      message
    });
  }
}
