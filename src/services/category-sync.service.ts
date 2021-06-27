import {bind, BindingScope} from '@loopback/core';
import {rabbitmqSubscribe} from "../decorators";
import {repository} from "@loopback/repository";
import {CategoryRepository} from "../repositories";
import {RabbitMQPayload, ResponseEnum} from "../servers";
import {BaseModelSyncService} from "./base-model-sync.service";

@bind({scope: BindingScope.SINGLETON})
export class CategorySyncService extends BaseModelSyncService {

  constructor(
    @repository(CategoryRepository)
    private repository: CategoryRepository
  ) {
    super();
  }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-videos/category',
    routingKey: 'model.category.*'
  })
  async handler({data, message}: RabbitMQPayload) {
    await this.sync({
      repo: this.repository,
      data,
      message
    });

    return ResponseEnum.NACK;
  }
}
