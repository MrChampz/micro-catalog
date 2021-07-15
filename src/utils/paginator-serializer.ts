import {RequestContext} from '@loopback/rest';
import {stringify} from 'qs';
import {classToPlain, Exclude, Expose} from 'class-transformer';

export class PaginatorSerializer<T = any> {
  @Exclude()
  baseUrl: string;

  constructor(
    public results: T[],
    public count: number,
    public limit: number,
    public offset: number,
  ) {}

  @Expose()
  get previous_url(): string | null {
    let previous = null;
    if (this.offset > 0 && this.count) {
      previous = `${this.baseUrl}?${stringify({
        filter: {
          limit: this.limit,
          ...(this.offset - this.limit >= 0 && {
            offset: this.offset - this.limit,
          }),
        },
      })}`;
    }
    return previous;
  }

  @Expose()
  get next_url(): string | null {
    let next = null;
    if (this.offset + this.limit < this.count) {
      next = `${this.baseUrl}?${stringify({
        filter: {
          limit: this.limit,
          ...(this.offset >= 0 &&
            this.limit >= 0 && {
              offset: this.offset + this.limit,
            }),
        },
      })}`;
    }
    return next;
  }

  toJson(request: RequestContext) {
    this.baseUrl = `${request.requestedBaseUrl}${request.request.url}`;
    this.baseUrl = this.baseUrl.split('?')[0];
    return classToPlain(this);
  }
}
