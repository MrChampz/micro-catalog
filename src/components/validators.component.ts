import {Binding, Component, CoreBindings, inject} from "@loopback/core";
import {RestTags} from "@loopback/rest";
import {DefaultCrudRepository} from "@loopback/repository";
import {ApplicationWithServices} from "@loopback/service-proxy";
import { ValidationError } from 'ajv';
import { difference } from "lodash";

export class ValidatorsComponent implements Component {
  bindings: Array<Binding> = [];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private app: ApplicationWithServices
  ) {
    this.bindings = this.validators();
  }

  validators() {
    return [
      Binding
        .bind('ajv.keywords.exists')
        .to({
          name: 'exists',
          validate: async ([model, field]: Array<any>, value: any) => {
            const values = Array.isArray(value) ? value : [value];
            const repository = this.getRepository(model);
            const rows = await repository.find({
              where: {
                or: values.map(value => ({[field]: value})),
              }
            });

            if (rows.length !== values.length) {
              const valuesNotExist = difference(
                values,
                rows.map(r => r[field])
              );

              const errors = valuesNotExist.map(v => ({
                message: `The value ${v} for ${model} not exits`,
              }));

              throw new ValidationError(errors as any);
            }

            return true;
          },
          async: true
        })
        .tag(RestTags.AJV_KEYWORD)
    ]
  }

  protected getRepository(model: string): DefaultCrudRepository<any, any> {
    return this.app.getSync<DefaultCrudRepository<any, any>>(
      `repositories.${model}Repository`
    );
  }
}