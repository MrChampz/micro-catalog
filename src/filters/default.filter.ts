import {AnyObject, Filter, FilterBuilder, JsonSchema, Model, Where, WhereBuilder} from "@loopback/repository";
import { clone } from "lodash";
import {builtinParsers, getJsonSchema} from "@loopback/rest";
import json = builtinParsers.json;

export abstract class DefaultFilter<T extends object = AnyObject>
  extends FilterBuilder<T> {

  defaultWhere: Where<T> | null | undefined;

  constructor(f?: Filter<T>) {
    super(f);
    const filter = this.defaultFilter();
    this.defaultWhere = filter ? clone(filter.filter.where) : null;
    this.filter.where = {};
  }

  isActive(modelCtor: typeof Model) {
    this.filter.where = new WhereBuilder<{is_active: boolean}>(this.filter.where)
      .eq('is_active', true)
      .build() as Where<T>;
    this.isActiveRelations(modelCtor);
    return this;
  }

  isActiveRelations(modelCtor: typeof Model) {
    const relations = Object.keys(modelCtor.definition.relations);

    if (!relations.length) {
      return this;
    }

    const schema = getJsonSchema(modelCtor);
    const relationsFiltered = relations.filter(relation => {
      const jsonSchema = schema.properties?.[relation] as JsonSchema;

      if (!jsonSchema ||
         (jsonSchema.type !== "array" && jsonSchema.type !== "object")) {
        return false;
      }

      const properties = (jsonSchema.items as any).properties || jsonSchema.properties;

      return Object.keys(properties).includes('is_active');
    });

    const whereStr = JSON.stringify(this.filter.where);

    const regex = new RegExp(
      `(${relationsFiltered.map(r => `${r}.*`).join('|')})`,
      'g'
    );
    
    const matches = whereStr.match(regex);
    if (!matches) {
      return this;
    }

    const fields = matches.map(m => {
      const relation = m.split('.')[0];
      return {[`${relation}.is_active`]: true};
    });

    this.filter.where = new WhereBuilder<{is_active: boolean}>(this.filter.where)
      .and(fields)
      .build() as Where<T>;
    return this;
  }

  build(): Filter<T> {
    return this.defaultWhere
      ? this.impose(this.defaultWhere).filter
      : this.filter;
  }

  protected defaultFilter(): DefaultFilter<T> | void {}
}