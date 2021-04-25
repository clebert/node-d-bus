import {MessageType} from 'd-bus-message-protocol';
import {arrayType, assertType, stringType, structType} from 'd-bus-type-system';
import {DBus} from './d-bus';
import {InterfaceElement, InterfaceStructure} from './interface-element';
import {MemberElement} from './member-element';

export type ObjectStructure = readonly [string, readonly InterfaceStructure[]];

export class ObjectElement {
  static readonly structureType = structType(
    stringType,
    arrayType(InterfaceElement.structureType)
  );

  static async getAll(
    dBus: DBus,
    serviceName: string
  ): Promise<readonly ObjectElement[]> {
    const {args} = await dBus.callMethod({
      messageType: MessageType.MethodCall,
      objectPath: '/',
      interfaceName: 'org.freedesktop.DBus.ObjectManager',
      memberName: 'GetManagedObjects',
      serial: dBus.nextSerial,
      destination: serviceName,
    });

    assertType(structType(arrayType(ObjectElement.structureType)), args);

    return args[0].map(ObjectElement.from);
  }

  static from(structure: ObjectStructure): ObjectElement {
    return new ObjectElement(
      structure[0],
      structure[1].map((interfaceStructure) =>
        InterfaceElement.from(interfaceStructure)
      )
    );
  }

  constructor(
    readonly objectPath: string,
    readonly interfaceElements: readonly InterfaceElement[]
  ) {}

  hasInterface(interfaceName: string, memberElement?: MemberElement): boolean {
    return this.interfaceElements.some(
      (interfaceElement) =>
        interfaceElement.interfaceName === interfaceName &&
        (!memberElement || interfaceElement.hasMember(memberElement))
    );
  }
}
