import {Entity, model, property} from '@loopback/repository';

export interface CategoryRelationship {
  id: string;
  name: string;
  is_active: boolean;
}

@model()
export class Category extends Entity {

  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 1,
      maxLength: 255,
    },
  })
  name: string;

  @property({
    type: 'string',
    required: false,
    default: null,
    jsonSchema: {
      nullable: true,
    },
  })
  description: string;

  @property({
    type: 'boolean',
    required: false,
    default: true
  })
  is_active?: boolean;

  @property({
    type: 'date',
    required: true
  })
  created_at: string;

  @property({
    type: 'date',
    require: true
  })
  updated_at: string;

  constructor(data?: Partial<Category>) {
    super(data);
  }
}

export interface CategoryRelations {
  // describe navigational properties here
}

export type CategoryWithRelations = Category & CategoryRelations;
