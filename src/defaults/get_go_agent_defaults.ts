import { Fields } from '../entity';

export function getGoAgentDefaults(): Fields {
  return {
    'agent.name': 'go',
    'agent.version': '1.14.0',
  };
}
