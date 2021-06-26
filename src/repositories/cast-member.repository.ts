import {DefaultCrudRepository} from '@loopback/repository';
import {CastMember, CastMemberRelations} from '../models';
import {Es7DataSource} from '../datasources';
import {inject} from '@loopback/core';

export class CastMemberRepository extends DefaultCrudRepository<
  CastMember,
  typeof CastMember.prototype.id,
  CastMemberRelations
> {
  constructor(@inject('datasources.es7') dataSource: Es7DataSource) {
    super(CastMember, dataSource);
  }
}
