import { service } from '../../src/service';
import { timerange } from '../../src/timerange';
import { getTransactionMetrics } from '../../src/utils/get_transaction_metrics';

describe('transaction metrics', () => {
  let events: Array<Record<string, any>>;

  beforeEach(() => {
    const javaService = service('opbeans-java', 'production', 'java');
    const javaInstance = javaService.instance('instance-1');

    const range = timerange(
      new Date(2021, 0, 1).getTime(),
      new Date(2021, 0, 1, 0, 15).getTime() - 1
    );

    events = getTransactionMetrics(
      range
        .every('1m', 25)
        .flatMap((timestamp) =>
          javaInstance
            .transaction('GET /api/product/list')
            .duration(1000)
            .success()
            .timestamp(timestamp)
            .serialize()
        )
        .concat(
          range
            .every('1m', 50)
            .flatMap((timestamp) =>
              javaInstance
                .transaction('GET /api/product/list')
                .duration(1000)
                .failure()
                .timestamp(timestamp)
                .serialize()
            )
        )
    );
  });

  it('generates the right amount of transaction metrics', () => {
    expect(events.length).toBe(30);
  });

  it('generates a metricset per interval', () => {
    const metricsSetsForSuccessfulTransactions = events.filter(
      (event) => event['event.outcome'] === 'success'
    );

    const [first, second] = metricsSetsForSuccessfulTransactions.map((event) =>
      new Date(event['@timestamp']).toISOString()
    );

    expect([first, second]).toEqual([
      '2020-12-31T23:00:00.000Z',
      '2020-12-31T23:01:00.000Z',
    ]);
  });

  it('generates a metricset per value of event.outcome', () => {
    const metricsSetsForSuccessfulTransactions = events.filter(
      (event) => event['event.outcome'] === 'success'
    );

    const metricsSetsForFailedTransactions = events.filter(
      (event) => event['event.outcome'] === 'failure'
    );

    expect(metricsSetsForSuccessfulTransactions.length).toBe(15);
    expect(metricsSetsForFailedTransactions.length).toBe(15);
  });

  it('captures all the values from aggregated transactions', () => {
    const metricsSetsForSuccessfulTransactions = events.filter(
      (event) => event['event.outcome'] === 'success'
    );

    const metricsSetsForFailedTransactions = events.filter(
      (event) => event['event.outcome'] === 'failure'
    );

    expect(metricsSetsForSuccessfulTransactions.length).toBe(15);

    metricsSetsForSuccessfulTransactions.forEach((event) => {
      expect(event['transaction.duration.histogram']).toEqual({
        values: [1000000],
        counts: [25],
      });
    });

    metricsSetsForFailedTransactions.forEach((event) => {
      expect(event['transaction.duration.histogram']).toEqual({
        values: [1000000],
        counts: [50],
      });
    });
  });
});
