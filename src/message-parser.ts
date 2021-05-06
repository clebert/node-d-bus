import {Message, parseMessages} from 'd-bus-message-protocol';
import {TextDecoder, TextEncoder} from 'util';

global.TextDecoder = TextDecoder as any;
global.TextEncoder = TextEncoder;

export class MessageParser {
  #data: readonly Buffer[] = [];

  parseMessages(data: Buffer): readonly Message[] | undefined {
    try {
      const messages = parseMessages(Buffer.concat([...this.#data, data]));

      this.#data = [];

      return messages;
    } catch (error) {
      if (error.message.includes('bounds')) {
        this.#data = [...this.#data, data];

        return undefined;
      }

      this.#data = [];

      throw error;
    }
  }
}
