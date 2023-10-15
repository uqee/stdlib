// https://stackoverflow.com/questions/31538010/test-if-a-variable-is-a-primitive-rather-than-an-object

import { Primitive } from './Primitive'

export const isPrimitive = (value: unknown): value is Primitive => {
  return value !== Object(value)
}
