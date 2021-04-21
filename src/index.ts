import {TextDecoder, TextEncoder} from 'util';

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any;
}

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder as any;
}

export * from './d-bus';
export * from './system-d-bus';
