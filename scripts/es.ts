import { inspect } from 'util';
import { Client } from '@elastic/elasticsearch';
import { chunk } from 'lodash';
import pLimit from 'p-limit';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { toElasticsearchOutput } from '../src';
import { simpleTrace } from './examples/01_simple_trace';

yargs(hideBin(process.argv))
  .command(
    'example',
    'run an example scenario',
    (yargs) => {
      return yargs
        .positional('scenario', {
          describe: 'scenario to run',
          choices: ['simple-trace'],
          demandOption: true,
        })
        .option('target', {
          describe: 'elasticsearch target, including username/password',
        })
        .option('from', { describe: 'start of timerange' })
        .option('to', { describe: 'end of timerange' })
        .option('workers', {
          default: 1,
          describe: 'number of concurrently connected ES clients',
        })
        .option('apm-server-version', {
          describe: 'APM Server version override',
        })
        .demandOption('target');
    },
    (argv) => {
      let events: Array<any> = [];
      const toDateString =
        (argv.to as string | undefined) || new Date().toISOString();
      const fromDateString =
        (argv.from as string | undefined) ||
        new Date(
          new Date(toDateString).getTime() - 15 * 60 * 1000
        ).toISOString();

      const to = new Date(toDateString).getTime();
      const from = new Date(fromDateString).getTime();

      switch (argv._[1]) {
        case 'simple-trace':
          events = simpleTrace(from, to);
          break;
      }

      const docs = toElasticsearchOutput(
        events,
        argv['apm-server-version'] as string
      );

      const client = new Client({
        node: argv.target as string,
      });

      const fn = pLimit(argv.workers);

      const batches = chunk(docs, 1000);

      console.log(
        'Uploading',
        docs.length,
        'docs in',
        batches.length,
        'batches',
        'from',
        fromDateString,
        'to',
        toDateString
      );

      Promise.all(
        batches.map((batch) =>
          fn(() => {
            return client.bulk({
              require_alias: true,
              body: batch.flatMap((doc) => {
                return [{ index: { _index: doc._index } }, doc._source];
              }),
            });
          })
        )
      )
        .then((results) => {
          const errors = results
            .flatMap((result) => result.body.items)
            .filter((item) => !!item.index.error)
            .map((item) => item.index.error);

          if (errors.length) {
            console.log(inspect(errors.slice(0, 10), { depth: null }));
            throw new Error('Failed to upload some items');
          }
          process.exit();
        })
        .catch((err) => {
          console.log(err);
          process.exit(1);
        });
    }
  )
  .parse();
