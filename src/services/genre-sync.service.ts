import {bind, BindingScope} from '@loopback/core';
import {rabbitmqSubscribe} from "../decorators";
import {RabbitMQPayload} from "../servers";
import { repository } from '@loopback/repository';
import { GenreRepository } from '../repositories';

@bind({scope: BindingScope.TRANSIENT})
export class GenreSyncService {
  constructor(
    @repository(GenreRepository)
    private repository: GenreRepository
  ) {}

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'genres',
    routingKey: 'model.genre.*'
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
