import { assertDefined } from './assertDefined.js'

export const envToString = <TString extends string = string>(
  string: string | undefined,
  strings?: TString[],
): TString => {
  assertDefined(string)

  if (strings !== undefined) {
    for (const s of strings) if (s === string) return string as TString
    throw new Error()
  }

  return string as TString
}
