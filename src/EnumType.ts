// https://stackoverflow.com/a/64331374/2736904

type EnumTypeString<TEnum extends string> = {
  [key in string]: TEnum | string //
}

type EnumTypeNumber<TEnum extends number> =
  | { [key in string]: TEnum | number }
  | { [key in number]: string }

export type EnumType<TEnum extends string | number> =
  | (TEnum extends string ? EnumTypeString<TEnum> : never)
  | (TEnum extends number ? EnumTypeNumber<TEnum> : never)

// type EnumOf<TEnumType> = TEnumType extends EnumType<infer U> ? U : never
