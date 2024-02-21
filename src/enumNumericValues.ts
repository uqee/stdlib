import { type EnumType } from './EnumType.js'

export const enumNumericValues = <TEnum extends string | number>(
  tenum: EnumType<TEnum>,
): TEnum[] =>
  Object.values(tenum).filter((value): value is TEnum => !isNaN(+value))
