import {inject, Provider, ValueOrPromise} from "@loopback/core";
import {OperationRetval, Response, RequestContext, Send} from "@loopback/rest";
import {PaginatorSerializer} from "../utils/paginator-serializer";
import {classToPlain} from "class-transformer";

export class ApiResourceProvider implements Provider<Send> {

  constructor(
    @inject.context()
    public request: RequestContext
  ) {}

  value(): ValueOrPromise<Send> {
    return (response: Response, result: OperationRetval) => {
      if (result) {
        response.json(
          result instanceof PaginatorSerializer
            ? result.toJson(this.request)
            : classToPlain(result)
        );
      }
      response.end();
    };
  }
}