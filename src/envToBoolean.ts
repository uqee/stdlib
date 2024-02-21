import { assert } from './assert.js'

export const envToBoolean = (string: string | undefined): boolean => {
  assert(string === 'true' || string === 'false')
  return string === 'true'
}
