import { BaseSpan } from './base_span';
import { Fields } from './entity';
import { generateEventId } from './utils/generate_id';

export class Transaction extends BaseSpan {
  constructor(fields: Fields) {
    super({
      ...fields,
      'processor.event': 'transaction',
      'transaction.id': generateEventId(),
      'transaction.sampled': true,
    });
  }
  override children(...children: BaseSpan[]) {
    super.children(...children);
    children.forEach((child) =>
      child.defaults({
        'transaction.id': this.fields['transaction.id'],
        'parent.id': this.fields['transaction.id'],
      })
    );
    return this;
  }

  duration(duration: number) {
    this.fields['transaction.duration.us'] = duration * 1000;
    return this;
  }
}
