import { assert } from './assert'

export function assertNonNullable<T>(
  t: T | null | undefined,
  message?: string,
): asserts t is T {
  assert(t != null, message)
}
