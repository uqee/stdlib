import { assert } from './assert'
import { isDefinedNotNan } from './isDefinedNotNan'

// https://github.com/microsoft/TypeScript/issues/34523
export function assertDefinedNotNan<T>(t: T | undefined, message?: string): asserts t is T {
  assert(isDefinedNotNan(t), message)
}
