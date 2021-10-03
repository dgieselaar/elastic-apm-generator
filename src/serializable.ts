import { Entity, Fields } from './entity';

export class Serializable extends Entity {
  constructor(fields: Fields) {
    super({
      ...fields,
    });
  }

  timestamp(time: number) {
    this.fields['@timestamp'] = time;
    return this;
  }
  serialize(): Array<Fields> {
    return [this.fields];
  }
}
