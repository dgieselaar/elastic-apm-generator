import * as uuid from 'uuid';

let seq = 0;

const namespace = 'f38d5b83-8eee-4f5b-9aa6-2107e15a71e3';

function generateId() {
  return uuid.v5(String(seq++), namespace).replace(/-/g, '');
}

export function generateEventId() {
  return generateId().substr(0, 16);
}

export function generateTraceId() {
  return generateId().substr(0, 32);
}
