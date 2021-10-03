import { Serializable } from './serializable';

export class Metricset extends Serializable {}

export function metricset(name: string) {
  return new Metricset({
    'metricset.name': name,
  });
}
