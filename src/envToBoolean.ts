import { toString } from './toString'

export const envToBoolean = (s: string | undefined): boolean => {
  if (s !== 'true' && s !== 'false') throw new Error(`Unknown ENV value: ${toString(s)}`)
  const b: boolean = s === 'true'
  return b
}
