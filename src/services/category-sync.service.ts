import {bind, BindingScope, service} from '@loopback/core';
import {rabbitmqSubscribe} from "../decorators";
import {repository} from "@loopback/repository";
import {CategoryRepository} from "../repositories";
import {RabbitMQPayload} from "../servers";
import {BaseModelSyncService} from "./base-model-sync.service";
import {ValidatorService} from "./validator.service";

@bind({scope: BindingScope.SINGLETON})
export class CategorySyncService extends BaseModelSyncService {

  constructor(
    @repository(CategoryRepository)
    private repository: CategoryRepository,

    @service(ValidatorService)
    private validator: ValidatorService,
  ) {
    super(validator);
  }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-videos/category',
    routingKey: 'model.category.*',
    queueOptions: {
      deadLetterExchange: "dlx.amq.topic"
    }
  })
  async handler({data, message}: RabbitMQPayload) {
    await this.sync({
      repo: this.repository,
      data,
      message
    });
  }
}
