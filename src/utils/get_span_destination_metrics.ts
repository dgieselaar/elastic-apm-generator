import { pick, sortBy } from 'lodash';
import moment from 'moment';
import objectHash from 'object-hash';
import { Fields } from '../entity';

export function getSpanDestinationMetrics(events: Array<Fields>) {
  const exitSpans = events.filter(
    (event) => !!event['span.destination.service.resource']
  );

  const metricsets = new Map<string, Fields>();

  function getSpanBucketKey(span: Fields) {
    return {
      '@timestamp': moment(span['@timestamp']).startOf('minute').valueOf(),
      ...pick(span, [
        'event.outcome',
        'agent.name',
        'service.environment',
        'service.name',
        'span.destination.service.resource',
      ]),
    };
  }

  for (const span of exitSpans) {
    const key = getSpanBucketKey(span);
    const id = objectHash(key);

    let metricset = metricsets.get(id);
    if (!metricset) {
      metricset = {
        ...key,
        'span.destination.service.response_time.sum.us': 0,
        'span.destination.service.response_time.count': 0,
      };
      metricsets.set(id, metricset);
    }
    metricset['span.destination.service.response_time.count']! += 1;
    metricset['span.destination.service.response_time.sum.us']! +=
      span['span.duration.us']!;
  }

  return [...Array.from(metricsets.values())];
}
