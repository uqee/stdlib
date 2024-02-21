import { assertDefined } from './assertDefined.js'

export const toDefined = <T>(t: T | undefined): T => {
  assertDefined(t)
  return t
}
