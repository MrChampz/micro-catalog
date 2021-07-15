import {
  lifeCycleObserver,
  LifeCycleObserver,
  ValueOrPromise,
} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {Client} from 'es7';
import dbConfig from './es7.datasource.config';

@lifeCycleObserver('datasource')
export class Es7DataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'es7';

  constructor(config = dbConfig) {
    super(config);
  }

  /**
   * Start the datasource when application is started
   */
  start(): ValueOrPromise<void> {
    // Add your logic here to be invoked when the application is started
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  stop(): ValueOrPromise<void> {
    return super.disconnect();
  }

  async deleteAllDocuments() {
    const datasource = this as any;
    const index = datasource.adapter.settings.index;
    const client: Client = datasource.adapter.db;

    await client.delete_by_query({
      index,
      body: {
        query: {match_all: {}},
      },
    });
  }
}
