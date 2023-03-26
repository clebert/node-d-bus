import type {Message} from 'd-bus-message-protocol';
import type {Socket} from 'node:net';

import {DBus} from './d-bus.js';
import {MessageParser} from './message-parser.js';
import {serializeMessage} from 'd-bus-message-protocol';
import {createConnection} from 'node:net';
import {getuid} from 'node:process';

export class SystemDBus extends DBus {
  #state:
    | readonly ['disconnected' | 'connecting' | 'failed']
    | readonly ['connected', Socket] = [`disconnected`];

  get state(): 'disconnected' | 'connecting' | 'connected' | 'failed' {
    return this.#state[0];
  }

  send(message: Message): void {
    if (this.#state[0] !== `connected`) {
      throw new Error(`Not connected.`);
    }

    this.#state[1].write(new Uint8Array(serializeMessage(message)));
  }

  async connectAsExternal(): Promise<void> {
    if (this.#state[0] !== `disconnected`) {
      throw new Error(`Already connected.`);
    }

    this.#state = [`connecting`];

    return new Promise<void>((resolve, reject) => {
      const address =
        process.env.DBUS_SYSTEM_BUS_ADDRESS ||
        `unix:path=/var/run/dbus/system_bus_socket`;

      if (!address.startsWith(`unix:path=`)) {
        throw new Error(
          `Only paths are supported as unix domain socket addresses.`,
        );
      }

      const socket = createConnection(address.slice(10));

      socket.once(`error`, (error) => {
        if (this.#state[0] === `connecting`) {
          this.#state = [`failed`];

          reject(error);
        } else if (
          this.#state[0] === `connected` &&
          this.#state[1] === socket
        ) {
          this.#state = [`failed`];

          this.emitError(error);
        }
      });

      const messageParser = new MessageParser();

      socket.on(`data`, (data) => {
        if (this.#state[0] === `connecting`) {
          if (data.toString().startsWith(`OK`)) {
            this.#state = [`connected`, socket];

            socket.write(`BEGIN\r\n`);

            resolve();
          } else {
            this.#state = [`failed`];

            reject(new Error(`External authentication failed.`));
          }
        } else if (
          this.#state[0] === `connected` &&
          this.#state[1] === socket
        ) {
          for (const message of messageParser.parseMessages(data) ?? []) {
            this.emitMessage(message);
          }
        }
      });

      socket.setNoDelay(true);
      socket.write(`\0`);

      const id = Buffer.from(getuid!().toString(), `ascii`).toString(`hex`);

      socket.write(`AUTH EXTERNAL ${id}\r\n`);
    });
  }

  disconnect(): void {
    if (this.#state[0] !== `connected`) {
      throw new Error(`Not connected.`);
    }

    this.#state[1].destroy();

    this.#state = [`disconnected`];
  }
}
