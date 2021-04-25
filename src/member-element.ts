import {
  VariantValue,
  stringType,
  structType,
  variantType,
} from 'd-bus-type-system';

export type MemberStructure = readonly [string, VariantValue];

export class MemberElement {
  static readonly structureType = structType(stringType, variantType);

  static from(structure: MemberStructure): MemberElement {
    return new MemberElement(structure[0], structure[1][1]);
  }

  constructor(readonly memberName: string, readonly memberValue: unknown) {}
}
