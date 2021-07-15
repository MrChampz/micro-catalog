import {CastMember, CastMemberRelations} from '../models';
import {Es7DataSource} from '../datasources';
import {inject} from '@loopback/core';
import {BaseRepository} from './base.repository';

export class CastMemberRepository extends BaseRepository<
  CastMember,
  typeof CastMember.prototype.id,
  CastMemberRelations
> {
  constructor(@inject('datasources.es7') dataSource: Es7DataSource) {
    super(CastMember, dataSource);
  }
}
