import {Client, givenHttpServerConfig} from '@loopback/testlab';
import supertest from 'supertest';
import {MicroCatalogApplication} from '../..';
import {Es7DataSource} from '../../datasources';
import config from '../../config';
import dbConfig from '../../datasources/es7.datasource.config';

export const testDb = new Es7DataSource({
  ...dbConfig,
  index: 'catalog-test'
});

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    port: 9000,
  });

  const app = new MicroCatalogApplication({
    ...config,
    rest: restConfig,
  });

  await app.boot();
  app.bind('datasources.es7').to(testDb);

  await app.start();

  const client = supertest('http://127.0.0.1:9000');

  return {app, client};
}

export async function clearDb() {
  await testDb.deleteAllDocuments();
}

export interface AppWithClient {
  app: MicroCatalogApplication;
  client: Client;
}
