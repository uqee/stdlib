import { assert } from './assert'

// https://github.com/microsoft/TypeScript/issues/34523
export function assertUndefined<T>(
  t: T | undefined,
  message?: string,
): asserts t is undefined {
  assert(t === undefined, message)
}
