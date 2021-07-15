import {bind, BindingScope, service} from '@loopback/core';
import {rabbitmqSubscribe} from '../decorators';
import {RabbitMQPayload} from '../servers';
import {repository} from '@loopback/repository';
import {CastMemberRepository} from '../repositories';
import {BaseModelSyncService} from './base-model-sync.service';
import {ValidatorService} from './validator.service';

@bind({scope: BindingScope.SINGLETON})
export class CastMemberSyncService extends BaseModelSyncService {
  constructor(
    @repository(CastMemberRepository)
    private repo: CastMemberRepository,

    @service(ValidatorService)
    private validator: ValidatorService,
  ) {
    super(validator);
  }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-videos/cast_member',
    routingKey: 'model.cast_member.*',
    queueOptions: {
      deadLetterExchange: 'dlx.amq.topic',
    },
  })
  async handler({data, message}: RabbitMQPayload) {
    await this.sync({
      repo: this.repo,
      data,
      message,
    });
  }
}
