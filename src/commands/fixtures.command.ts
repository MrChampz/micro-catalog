import {default as chalk} from 'chalk';
import {Client} from 'es7';
import {MicroCatalogApplication} from "../application";
import {Es7DataSource} from "../datasources";
import config from '../config';
import fixtures from '../fixtures';
import {DefaultCrudRepository} from "@loopback/repository";
import {ValidatorService} from "../services";

export class FixturesCommand {
  static command = "fixtures";
  static description = "Generate and store Fixture data in ElasticSearch";

  app: MicroCatalogApplication;

  async run() {
    console.log(chalk.magenta("Fixture data"));
    await this.bootApp();

    console.log(chalk.green("Delete all documents"));
    await this.deleteAllDocuments();

    const validator = this.app.getSync<ValidatorService>('services.ValidatorService');

    console.log(chalk.green("Inserting new documents"));
    for (const fixture of fixtures) {
      const repository = this.getRepository<DefaultCrudRepository<any, any>>(fixture.model);
      await validator.validate({
        data: fixture.fields,
        entityClass: repository.entityClass
      });
      await repository.create(fixture.fields);
    }

    console.log(chalk.blue("Documents generated :)"));
  }

  private async bootApp() {
    this.app = new MicroCatalogApplication(config);
    await this.app.boot();
  }

  private async deleteAllDocuments() {
    const datasource = this.app.getSync<Es7DataSource>('datasources.es7');
    const index = (datasource as any).adapter.settings.index;
    const client: Client = (datasource as any).adapter.db;

    await client.delete_by_query({
      index,
      body: {
        query: { match_all: {}}
      }
    });
  }

  private getRepository<T>(modelName: string): T {
    return this.app.getSync<T>(`repositories.${modelName}Repository`);
  }
}