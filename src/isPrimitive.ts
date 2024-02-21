// https://stackoverflow.com/questions/31538010/test-if-a-variable-is-a-primitive-rather-than-an-object

import { type Primitive } from './Primitive.js'

export const isPrimitive = (value: unknown): value is Primitive => {
  return value !== Object(value)
}
