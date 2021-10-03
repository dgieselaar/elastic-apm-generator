import { Entity } from './entity';
import { Span } from './span';
import { Transaction } from './transaction';

export class Instance extends Entity {
  transaction(transactionName: string, transactionType = 'request') {
    return new Transaction({
      ...this.fields,
      'transaction.name': transactionName,
      'transaction.type': transactionType,
    });
  }

  span(spanName: string, spanType: string, spanSubtype?: string) {
    return new Span({
      ...this.fields,
      'span.name': spanName,
      'span.type': spanType,
      'span.subtype': spanSubtype,
    });
  }
}
