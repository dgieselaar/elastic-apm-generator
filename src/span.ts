import { BaseSpan } from './base_span';
import { Fields } from './entity';
import { generateEventId } from './utils/generate_id';

export class Span extends BaseSpan {
  constructor(fields: Fields) {
    super({
      ...fields,
      'processor.event': 'span',
      'span.id': generateEventId(),
    });
  }

  override children(...children: BaseSpan[]) {
    super.children(...children);

    children.forEach((child) =>
      child.defaults({
        'parent.id': this.fields['span.id'],
      })
    );

    return this;
  }

  duration(duration: number) {
    this.fields['span.duration.us'] = duration * 1000;
    return this;
  }

  destination(resource: string, type?: string, name?: string) {
    if (!type) {
      type = this.fields['span.type'];
    }

    if (!name) {
      name = resource;
    }
    this.fields['span.destination.service.resource'] = resource;
    this.fields['span.destination.service.name'] = name;
    this.fields['span.destination.service.type'] = type;

    return this;
  }
}
