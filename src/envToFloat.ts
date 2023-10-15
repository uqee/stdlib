import { assertDefined } from './assertDefined'

export const envToFloat = <T extends number = number>(s: string | undefined): T => {
  assertDefined(s)

  const f: T = parseFloat(s) as T
  if (isNaN(f)) throw new Error(`Invalid ENV value: ${s}`)

  return f
}
