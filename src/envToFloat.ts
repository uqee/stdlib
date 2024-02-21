import { assert } from './assert.js'
import { assertDefined } from './assertDefined.js'
import { type Float } from './Float.js'

export const envToFloat = <TFloat extends Float = Float>(
  string: string | undefined,
): TFloat => {
  assertDefined(string)

  const float: TFloat = parseFloat(string) as TFloat
  assert(!isNaN(float))

  return float
}
