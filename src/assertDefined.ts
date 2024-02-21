import { assert } from './assert.js'

// https://github.com/microsoft/TypeScript/issues/34523
export function assertDefined<T>(
  t: T | undefined,
  message?: string,
): asserts t is T {
  assert(t !== undefined, message)
}
