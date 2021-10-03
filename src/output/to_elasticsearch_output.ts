import { set } from 'lodash';
import { getObserverDefaults } from '..';
import { Fields } from '../entity';

export function toElasticsearchOutput(
  events: Fields[],
  versionOverride?: string
) {
  return events.map((event) => {
    const values = {
      ...event,
      '@timestamp': new Date(event['@timestamp']!).toISOString(),
      'timestamp.us': event['@timestamp']! * 1000,
      'ecs.version': '1.4',
      ...getObserverDefaults(),
    };

    const document = {};
    for (const key in values) {
      set(document, key, values[key as keyof typeof values]);
    }
    return {
      _index: `apm-${versionOverride || values['observer.version']}-${
        values['processor.event']
      }`,
      _source: document,
    };
  });
}
