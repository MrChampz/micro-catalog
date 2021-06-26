import {bind, BindingScope} from '@loopback/core';
import {rabbitmqSubscribe} from "../decorators";
import {RabbitMQPayload} from "../servers";
import { repository } from '@loopback/repository';
import { CastMemberRepository } from '../repositories';

@bind({scope: BindingScope.TRANSIENT})
export class CastMemberSyncService {
  constructor(
    @repository(CastMemberRepository)
    private repository: CastMemberRepository
  ) {}

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'cast-members',
    routingKey: 'model.castMember.*'
  })
  async handler({data, message}: RabbitMQPayload) {
    const [event] = message.fields.routingKey.split('.').slice(2);
    switch (event) {
      case 'created':
        await this.repository.create(data);
        break;
      case 'updated':
        await this.repository.updateById(data.id, data);
        break;
      case 'deleted':
        await this.repository.deleteById(data.id);
        break;
    }
  }
}
