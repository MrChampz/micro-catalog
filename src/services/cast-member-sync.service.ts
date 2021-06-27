import {bind, BindingScope} from '@loopback/core';
import {rabbitmqSubscribe} from "../decorators";
import {RabbitMQPayload} from "../servers";
import { repository } from '@loopback/repository';
import { CastMemberRepository } from '../repositories';
import {BaseModelSyncService} from "./base-model-sync.service";

@bind({scope: BindingScope.SINGLETON})
export class CastMemberSyncService extends BaseModelSyncService {

  constructor(
    @repository(CastMemberRepository)
    private repository: CastMemberRepository
  ) {
    super();
  }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-videos/cast-member',
    routingKey: 'model.cast-member.*'
  })
  async handler({data, message}: RabbitMQPayload) {
    await this.sync({
      repo: this.repository,
      data,
      message
    });
  }
}
