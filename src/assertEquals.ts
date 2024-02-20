import { assert } from './assert'

export function assertEquals<Something extends string>(
  value: string,
  something: Something,
): asserts value is Something {
  assert(value === something)
}
