import { assert } from './assert'

export const envToBoolean = (string: string | undefined): boolean => {
  assert(string === 'true' || string === 'false')
  return string === 'true'
}
