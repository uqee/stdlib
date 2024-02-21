import { assert } from './assert.js'

export function assertNonNullable<T>(
  t: T | null | undefined,
  message?: string,
): asserts t is T {
  assert(t != null, message)
}
