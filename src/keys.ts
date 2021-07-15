import {CoreBindings} from '@loopback/core';
import {RabbitMQConfig} from './servers';

export namespace RabbitMQBindings {
  export const CONFIG =
    CoreBindings.APPLICATION_CONFIG.deepProperty<RabbitMQConfig>('rabbitmq');
}
