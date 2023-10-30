import { assert } from './assert'
import { assertDefined } from './assertDefined'
import { Float } from './Float'

export const envToFloat = <TFloat extends Float = Float>(
  string: string | undefined,
): TFloat => {
  assertDefined(string)

  const float: TFloat = parseFloat(string) as TFloat
  assert(!isNaN(float))

  return float
}
