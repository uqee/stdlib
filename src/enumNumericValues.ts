import { EnumType } from './EnumType'

export const enumNumericValues = <TEnum extends string | number>(tenum: EnumType<TEnum>): TEnum[] =>
  Object.values(tenum).filter((value): value is TEnum => !isNaN(+value))
