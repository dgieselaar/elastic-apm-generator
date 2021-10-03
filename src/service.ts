import { Entity } from './entity';
import { Instance } from './instance';

export class Service extends Entity {
  instance(instanceName: string) {
    return new Instance({
      ...this.fields,
      ['service.node.name']: instanceName,
    });
  }
}

export function service(name: string, environment: string, agentName: string) {
  return new Service({
    'service.name': name,
    'service.environment': environment,
    'agent.name': agentName,
  });
}
