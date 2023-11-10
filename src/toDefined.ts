import { assertDefined } from './assertDefined'

export const toDefined = <T>(t: T | undefined): T => {
  assertDefined(t)
  return t
}
