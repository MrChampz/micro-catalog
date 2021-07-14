import {inject} from '@loopback/core';
import {Es7DataSource} from '../datasources';
import {Category, CategoryRelations} from '../models';
import {BaseRepository} from "./base.repository";

export class CategoryRepository extends BaseRepository<
  Category,
  typeof Category.prototype.id,
  CategoryRelations
> {
  constructor(@inject('datasources.es7') dataSource: Es7DataSource) {
    super(Category, dataSource);
  }
}
