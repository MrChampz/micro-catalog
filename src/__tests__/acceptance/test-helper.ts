import {Client, givenHttpServerConfig} from '@loopback/testlab';
import supertest from 'supertest';
import {MicroCatalogApplication} from '../..';
import config from '../../config';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    port: 9000
  });

  const app = new MicroCatalogApplication({
    ...config,
    rest: restConfig,
  });

  await app.boot();
  await app.start();

  const client = supertest("http://127.0.0.1:9000");

  return {app, client};
}

export interface AppWithClient {
  app: MicroCatalogApplication;
  client: Client;
}
