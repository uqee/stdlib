import { expect, test } from '@jest/globals'

import { enumNumericValues } from './enumNumericValues.js'

enum E {
  A = 1,
  B = 2,
  C = 3,
}

test('enumNumericValues', () => {
  expect(enumNumericValues(E)).toEqual([1, 2, 3])
})
