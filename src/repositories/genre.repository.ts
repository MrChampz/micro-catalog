import {DefaultCrudRepository} from '@loopback/repository';
import {Genre, GenreRelations} from '../models';
import {Es7DataSource} from '../datasources';
import {inject} from '@loopback/core';

export class GenreRepository extends DefaultCrudRepository<
  Genre,
  typeof Genre.prototype.id,
  GenreRelations
> {
  constructor(@inject('datasources.es7') dataSource: Es7DataSource) {
    super(Genre, dataSource);
  }
}
