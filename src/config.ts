export default {
  rest: {
    port: +(process.env.PORT ?? 3000),
    host: process.env.HOST,
    // The `gracePeriodForClose` provides a graceful close for http/https
    // servers with keep-alive clients. The default value is `Infinity`
    // (don't force-close). If you want to immediately destroy all sockets
    // upon stop, set its value to `0`.
    // See https://www.npmjs.com/package/stoppable
    gracePeriodForClose: 5000, // 5 seconds
    openApiSpec: {
      // useful when used with OpenAPI-to-GraphQL to locate your application
      setServersFromRequest: true,
    },
  },
  rabbitmq: {
    uri: process.env.RABBITMQ_URI,
    defaultHandlerError: parseInt(process.env.RABBITMQ_HANDLER_ERROR || '0'),
    exchanges: [
      {
        name: "dlx.amq.topic",
        type: "topic"
      }
    ],
    queues: [
      {
        name: "dlx.sync-videos",
        exchange: {
          name: "dlx.amq.topic",
          routingKey: "model.*.*"
        },
        options: {
          deadLetterExchange: 'amq.topic',
          messageTtl: 20000
        }
      }
    ]
  },
  jwt: {
    secret: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtwtg84NrFkocCNgPkYOrztQZaQpg2t8vk6B/YDKQMfXvAfXHzKkcF58LusSuM5x3yEoeV1kJr3HYsSJiT0iWUTHx1rmGln/992tw5+efuhOxnHcXmvTuIx9wYo6lC3g05uhifF8n9ahQHlIv1OlsZHuEndSS7e/HwCWuQlaj8ufIu41uaHxuzZgzctH/jFF4gObhCGSho+46VSPl5rpHWxLp0TvX6w+H2MNCVb5bMSgNOOIVh2UYUhLyfckBdjeiyM3wZGdoXm/hfyzs3/uwZ+N01KOKubN1GmJYDKfPj04NzIhCxtgPIvYu3LwCZiAorh/ExjeoHQRGDHp0aETS9QIDAQAB\n-----END PUBLIC KEY-----"
  }
};