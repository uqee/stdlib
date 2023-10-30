import { assert } from './assert'
import { assertDefined } from './assertDefined'
import { Integer } from './Integer'

export const envToInteger = <TInteger extends Integer = Integer>(
  string: string | undefined,
  integers?: TInteger[],
): TInteger => {
  assertDefined(string)

  const integer: TInteger = parseInt(string, 10) as TInteger
  assert(!isNaN(integer))

  if (integers !== undefined) {
    for (const i of integers) if (i === integer) return integer
    throw new Error()
  }

  return integer
}
