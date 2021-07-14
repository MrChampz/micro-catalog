import {DefaultCrudRepository, EntityNotFoundError} from "@loopback/repository";
import {Message} from "amqplib";
import {pick} from "lodash";
import {ValidatorService} from "./validator.service";
import {BaseRepository} from "../repositories/base.repository";

export interface SyncOptions {
  repo: DefaultCrudRepository<any, any>;
  data: any;
  message: Message;
}

export interface SyncRelationOptions {
  id: string;
  repo: BaseRepository<any, any>;
  relationName: string;
  relationIds: string[];
  relationRepo: DefaultCrudRepository<any, any>;
  message: Message;
}

export abstract class BaseModelSyncService {

  protected constructor(private validatorService: ValidatorService) {}

  protected async sync({repo, data, message}: SyncOptions) {
    const {id} = data || {};
    const action = this.getAction(message);
    const entity = this.createEntity(data, repo);
    switch (action) {
      case 'created':
        await this.validatorService.validate({
          data: entity,
          entityClass: repo.entityClass,
        });
        await repo.create(entity);
        break;
      case 'updated':
        await this.updateOrCreate(repo, id, entity);
        break;
      case 'deleted':
        await repo.deleteById(id);
        break;
    }
  }

  protected getAction(message: Message) {
    return message.fields.routingKey.split('.')[2];
  }

  protected createEntity(data: any, repo: DefaultCrudRepository<any, any>) {
    return pick(data, Object.keys(repo.entityClass.definition.properties));
  }

  protected async updateOrCreate(repo: DefaultCrudRepository<any, any>, id: string, entity: any) {
    const exists = await repo.exists(id);
    await this.validatorService.validate({
      data: entity,
      entityClass: repo.entityClass,
      ...(exists && {options: {partial: true}})
    });
    return exists ? repo.updateById(id, entity) : repo.create(entity);
  }

  protected async syncRelation({
    id,
    repo,
    relationName,
    relationIds,
    relationRepo,
    message
  }: SyncRelationOptions) {
    const relationFields = this.extractRelationFields(repo, relationName);
    const entitiesFound = await this.findRelatedEntities(relationRepo, relationIds, relationFields);

    if (!entitiesFound.length) {
      const error = new EntityNotFoundError(relationRepo.entityClass, relationIds);
      error.name = "EntityNotFound";
      throw error;
    }

    const action = this.getAction(message);
    switch (action) {
      case 'attached':
        await repo.attachRelation(id, relationName, entitiesFound);
        break;
      case 'detached':
        await repo.detachRelation(id, relationName, entitiesFound);
        break;
    }
  }

  protected extractRelationFields(repo: DefaultCrudRepository<any, any>, relationName: string) {
    return Object.keys(
      repo.modelClass.definition.properties[relationName]
        .jsonSchema.items.properties
    ).reduce((obj: any, field: string) => {
      obj[field] = true;
      return obj;
    }, {});
  }

  protected findRelatedEntities(
    relationRepo: DefaultCrudRepository<any, any>,
    relationIds: string[],
    relationFields: any
  ) {
    return relationRepo.find({
      where: {
        or: relationIds.map(id => ({id}))
      },
      fields: relationFields,
    });
  }
}
