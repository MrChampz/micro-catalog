import {CoreBindings} from "@loopback/core";
import {RabbitMQConfig} from "./servers";
import {JwtConfig} from "./services/auth/jwt.service";

export namespace RabbitMQBindings {
  export const CONFIG =
    CoreBindings.APPLICATION_CONFIG.deepProperty<RabbitMQConfig>('rabbitmq');
}

export namespace JwtBindings {
  export const CONFIG =
    CoreBindings.APPLICATION_CONFIG.deepProperty<JwtConfig>('jwt');
}