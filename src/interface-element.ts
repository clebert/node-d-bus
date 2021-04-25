import {arrayType, stringType, structType} from 'd-bus-type-system';
import {MemberElement, MemberStructure} from './member-element';

export type InterfaceStructure = readonly [string, readonly MemberStructure[]];

export class InterfaceElement {
  static readonly structureType = structType(
    stringType,
    arrayType(MemberElement.structureType)
  );

  static from(structure: InterfaceStructure): InterfaceElement {
    return new InterfaceElement(
      structure[0],
      structure[1].map((memberStructure) => MemberElement.from(memberStructure))
    );
  }

  constructor(
    readonly interfaceName: string,
    readonly memberElements: readonly MemberElement[]
  ) {}

  hasMember(memberElement: MemberElement): boolean {
    return this.memberElements.some(
      ({memberName, memberValue}) =>
        memberName === memberElement.memberName &&
        memberValue === memberElement.memberValue
    );
  }
}
