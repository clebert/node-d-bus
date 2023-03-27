import {MessageParser} from './message-parser.js';
import {describe, expect, test} from '@jest/globals';

function toBuffer(...bytes: string[]): Buffer {
  const array: number[] = [];

  for (const byte of bytes.join(` `).split(` `)) {
    if (byte.trim()) {
      array.push(parseInt(byte, 16));
    }
  }

  return Buffer.from(array);
}

const validData = toBuffer(
  `6c 01 00 01 00 00 00 00 01 00 00 00 6d 00 00 00`,
  `01 01 6f 00 15 00 00 00 2f 6f 72 67 2f 66 72 65`,
  `65 64 65 73 6b 74 6f 70 2f 44 42 75 73 00 00 00`,
  `02 01 73 00 14 00 00 00 6f 72 67 2e 66 72 65 65`,
  `64 65 73 6b 74 6f 70 2e 44 42 75 73 00 00 00 00`,
  `03 01 73 00 05 00 00 00 48 65 6c 6c 6f 00 00 00`,
  `06 01 73 00 14 00 00 00 6f 72 67 2e 66 72 65 65`,
  `64 65 73 6b 74 6f 70 2e 44 42 75 73 00 00 00 00`,
);

const invalidData = toBuffer(
  `6c 01 00 01 00 00 00 00 01 00 00 00 6d 00 00 00`,
  `01 01 6f ff`,
);

const messages = [
  {
    messageType: 1,
    objectPath: `/org/freedesktop/DBus`,
    interfaceName: `org.freedesktop.DBus`,
    memberName: `Hello`,
    serial: 1,
    noReplyExpected: false,
    noAutoStart: false,
    allowInteractiveAuthorization: false,
    destination: `org.freedesktop.DBus`,
  },
];

describe(`MessageParser`, () => {
  test(`parse incomplete messages`, () => {
    const messageParser = new MessageParser();

    expect(messageParser.parseMessages(validData)).toEqual(messages);

    expect(messageParser.parseMessages(validData.subarray(0, 10))).toEqual(
      undefined,
    );

    expect(messageParser.parseMessages(validData.subarray(10, 100))).toEqual(
      undefined,
    );

    expect(messageParser.parseMessages(validData.subarray(100))).toEqual(
      messages,
    );

    expect(messageParser.parseMessages(validData)).toEqual(messages);

    expect(messageParser.parseMessages(invalidData.subarray(0, 10))).toEqual(
      undefined,
    );

    expect(() => messageParser.parseMessages(invalidData.subarray(10))).toThrow(
      new Error(
        `type=a; type=r=a[0]; type=v=r[1]; type=g=v[0]; byte-offset=19; expected-nul-byte`,
      ),
    );

    expect(messageParser.parseMessages(validData)).toEqual(messages);
  });
});
