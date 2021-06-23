import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {Es7DataSource} from '../datasources';
import {Category, CategoryRelations} from '../models';

export class CategoryRepository extends DefaultCrudRepository<
  Category,
  typeof Category.prototype.id,
  CategoryRelations
> {
  constructor(@inject('datasources.es7') dataSource: Es7DataSource) {
    super(Category, dataSource);
  }
}
