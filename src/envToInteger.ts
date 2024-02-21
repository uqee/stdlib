import { assert } from './assert.js'
import { assertDefined } from './assertDefined.js'
import { type Integer } from './Integer.js'

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
