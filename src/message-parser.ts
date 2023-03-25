import type {Message} from 'd-bus-message-protocol';
import {parseMessages} from 'd-bus-message-protocol';

export class MessageParser {
  #data: readonly Buffer[] = [];

  parseMessages(data: Buffer): readonly Message[] | undefined {
    try {
      const messages = parseMessages(Buffer.concat([...this.#data, data]));

      this.#data = [];

      return messages;
    } catch (error) {
      if (error instanceof Error && error.message.includes(`bounds`)) {
        this.#data = [...this.#data, data];

        return undefined;
      }

      this.#data = [];

      throw error;
    }
  }
}
