import {MessageType, MethodReturnMessage} from 'd-bus-message-protocol';
import {
  CompleteType,
  assertType,
  stringType,
  structType,
  variantType,
} from 'd-bus-type-system';
import {DBus} from './d-bus';
import {ObjectElement} from './object-element';

export class ProxyObject {
  constructor(
    readonly dBus: DBus,
    readonly serviceName: string,
    readonly objectPath: string,
    readonly interfaceName: string
  ) {}

  async getProperty(memberName: string): Promise<unknown> {
    let message: MethodReturnMessage;

    try {
      message = await this.dBus.callMethod({
        messageType: MessageType.MethodCall,
        objectPath: this.objectPath,
        interfaceName: 'org.freedesktop.DBus.Properties',
        memberName: 'Get',
        serial: this.dBus.nextSerial,
        destination: this.serviceName,
        types: [stringType, stringType],
        args: [this.interfaceName, memberName],
      });
    } catch (error) {
      if (error.message === `No such property '${memberName}'`) {
        return undefined;
      }

      throw error;
    }

    assertType(structType(variantType), message.args);

    return message.args[0][1];
  }

  async setProperty(
    memberName: string,
    memberType: CompleteType,
    memberValue: unknown
  ): Promise<void> {
    await this.dBus.callMethod({
      messageType: MessageType.MethodCall,
      objectPath: this.objectPath,
      interfaceName: 'org.freedesktop.DBus.Properties',
      memberName: 'Set',
      serial: this.dBus.nextSerial,
      destination: this.serviceName,
      types: [stringType, stringType, variantType],
      args: [this.interfaceName, memberName, [memberType, memberValue]],
    });
  }

  async callMethod(memberName: string): Promise<MethodReturnMessage>;

  async callMethod(
    memberName: string,
    types: readonly [CompleteType, ...CompleteType[]],
    args: readonly [unknown, ...unknown[]]
  ): Promise<MethodReturnMessage>;

  async callMethod(
    memberName: string,
    types?: readonly [CompleteType, ...CompleteType[]],
    args?: readonly [unknown, ...unknown[]]
  ): Promise<MethodReturnMessage> {
    return this.dBus.callMethod({
      messageType: MessageType.MethodCall,
      objectPath: this.objectPath,
      interfaceName: this.interfaceName,
      memberName,
      serial: this.dBus.nextSerial,
      destination: this.serviceName,
      types,
      args,
    });
  }

  async getObjectElements(): Promise<readonly ObjectElement[]> {
    return ObjectElement.getAll(this.dBus, this.serviceName);
  }
}
