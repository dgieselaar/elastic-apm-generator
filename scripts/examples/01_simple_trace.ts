import {
  service,
  timerange,
  getTransactionMetrics,
  getSpanDestinationMetrics,
  getGoAgentDefaults,
} from '../../src';

export function simpleTrace(from: number, to: number) {
  const instance = service('opbeans-go', 'production', 'go')
    .defaults(getGoAgentDefaults())
    .instance('instance');

  const range = timerange(from, to);

  const success = range
    .every('1m', 50)
    .flatMap((timestamp) =>
      instance
        .transaction('GET /api/product/list')
        .timestamp(timestamp)
        .duration(1000)
        .success()
        .children(
          instance
            .span('GET apm-*/_search', 'db', 'elasticsearch')
            .duration(1000)
            .success()
            .destination('elasticsearch')
            .timestamp(timestamp),
          instance
            .span('custom_operation', 'app')
            .duration(50)
            .success()
            .timestamp(timestamp)
        )
        .serialize()
    );

  const failed = range
    .every('1m', 25)
    .flatMap((timestamp) =>
      instance
        .transaction('GET /api/product/list')
        .timestamp(timestamp)
        .duration(1000)
        .failure()
        .serialize()
    );

  const events = success.concat(failed);

  return events
    .concat(getTransactionMetrics(events))
    .concat(getSpanDestinationMetrics(events));
}
