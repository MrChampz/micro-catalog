import {Genre, GenreRelations} from '../models';
import {Es7DataSource} from '../datasources';
import {inject} from '@loopback/core';
import {BaseRepository} from './base.repository';

export class GenreRepository extends BaseRepository<
  Genre,
  typeof Genre.prototype.id,
  GenreRelations
> {
  constructor(@inject('datasources.es7') dataSource: Es7DataSource) {
    super(Genre, dataSource);
  }
}
