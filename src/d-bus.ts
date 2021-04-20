import {
  Message,
  MessageType,
  MethodCallMessage,
  MethodReturnMessage,
} from 'd-bus-message-protocol';

export abstract class DBus {
  readonly #errorListeners = new Set<(error: Error) => void>();
  readonly #messageListeners = new Set<(message: Message) => void>();

  async callMethod(message: MethodCallMessage): Promise<MethodReturnMessage> {
    return new Promise<MethodReturnMessage>((resolve, reject) => {
      this.send(message);

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
            offError?.();
            offMessage?.();
            reject(new Error(String(otherMessage.body)));
          }
        }
      });
    });
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
      listener(error);
    }
  }

  protected emitMessage(message: Message): void {
    for (const listener of this.#messageListeners) {
      listener(message);
    }
  }
}
