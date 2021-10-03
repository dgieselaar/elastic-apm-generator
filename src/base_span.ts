import { Fields } from './entity';
import { Serializable } from './serializable';
import { generateTraceId } from './utils/generate_id';

export class BaseSpan extends Serializable {
  private _children: BaseSpan[] = [];

  constructor(fields: Fields) {
    super({
      ...fields,
      'event.outcome': 'unknown',
      'trace.id': generateTraceId(),
      'processor.name': 'transaction',
    });
  }

  traceId(traceId: string) {
    this.fields['trace.id'] = traceId;
    this._children.forEach((child) => {
      child.fields['trace.id'] = traceId;
    });
    return this;
  }

  children(...children: BaseSpan[]) {
    this._children.push(...children);
    children.forEach((child) => {
      child.traceId(this.fields['trace.id']!);
    });

    return this;
  }

  success() {
    this.fields['event.outcome'] = 'success';
    return this;
  }

  failure() {
    this.fields['event.outcome'] = 'failure';
    return this;
  }

  override serialize(): Array<Fields> {
    return [
      this.fields,
      ...this._children.flatMap((child) => child.serialize()),
    ];
  }
}
