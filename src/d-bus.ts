import {
  Message,
  MessageType,
  MethodCallMessage,
  MethodReturnMessage,
} from 'd-bus-message-protocol';
import {assertType, stringType, structType} from 'd-bus-type-system';

export abstract class DBus {
  readonly #errorListeners = new Set<(error: Error) => void>();
  readonly #messageListeners = new Set<(message: Message) => void>();

  #serial = 0;

  get nextSerial(): number {
    return ++this.#serial;
  }

  async callMethod(message: MethodCallMessage): Promise<MethodReturnMessage> {
    return new Promise<MethodReturnMessage>((resolve, reject) => {
      let offError: (() => void) | undefined;
      let offMessage: (() => void) | undefined;

      offError = this.onError((error) => {
        offError?.();
        offMessage?.();
        reject(error);
      });

      offMessage = this.onMessage((otherMessage) => {
        if (otherMessage.messageType === MessageType.MethodReturn) {
          if (otherMessage.replySerial === message.serial) {
            offError?.();
            offMessage?.();
            resolve(otherMessage);
          }
        } else if (otherMessage.messageType === MessageType.Error) {
          if (otherMessage.replySerial === message.serial) {
            const errorMessage = otherMessage.args?.[0];

            offError?.();
            offMessage?.();
            reject(new Error(`${otherMessage.errorName}: ${errorMessage}`));
          }
        }
      });

      this.send(message);
    });
  }

  async hello(): Promise<string> {
    const {args} = await await this.callMethod({
      messageType: MessageType.MethodCall,
      objectPath: '/org/freedesktop/DBus',
      interfaceName: 'org.freedesktop.DBus',
      memberName: 'Hello',
      serial: this.nextSerial,
      destination: 'org.freedesktop.DBus',
    });

    assertType(structType(stringType), args);

    return args[0];
  }

  onError(listener: (error: Error) => void): () => void {
    this.#errorListeners.add(listener);

    return () => this.#errorListeners.delete(listener);
  }

  onMessage(listener: (message: Message) => void): () => void {
    this.#messageListeners.add(listener);

    return () => this.#messageListeners.delete(listener);
  }

  abstract send(message: Message): void;

  protected emitError(error: Error): void {
    for (const listener of this.#errorListeners) {
      try {
        listener(error);
      } catch (error) {
        console.error('Failed to notify error listener.', error);
      }
    }
  }

  protected emitMessage(message: Message): void {
    for (const listener of this.#messageListeners) {
      try {
        listener(message);
      } catch (error) {
        console.error('Failed to notify message listener.', error);
      }
    }
  }
}
