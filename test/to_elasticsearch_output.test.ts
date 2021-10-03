import { Fields } from '../src/entity';
import { toElasticsearchOutput } from '../src/output/to_elasticsearch_output';

describe('output to elasticsearch', () => {
  let event: Fields;

  beforeEach(() => {
    event = {
      '@timestamp': new Date(2021, 0, 1).getTime(),
      'processor.event': 'transaction',
      'processor.name': 'transaction',
    };
  });

  it('properly formats @timestamp', () => {
    const doc = toElasticsearchOutput([event])[0] as any;

    expect(doc['@timestamp']).toEqual('2020-12-31T23:00:00.000Z');
  });

  it('formats a nested object', () => {
    const doc = toElasticsearchOutput([event])[0] as any;

    expect(doc.processor).toEqual({
      event: 'transaction',
      name: 'transaction',
    });
  });
});
