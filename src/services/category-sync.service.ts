import {bind, BindingScope} from '@loopback/core';
import {rabbitmqSubscribe} from "../decorators";
import {repository} from "@loopback/repository";
import {CategoryRepository} from "../repositories";
import {RabbitMQPayload} from "../servers";

@bind({scope: BindingScope.TRANSIENT})
export class CategorySyncService {
  constructor(
    @repository(CategoryRepository)
    private repository: CategoryRepository
  ) {}

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'categories',
    routingKey: 'model.category.*'
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
