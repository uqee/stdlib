import { assertDefined } from './assertDefined'

export const envToString = <T extends string = string>(s: string | undefined, ts?: T[]): T => {
  assertDefined(s)

  if (ts !== undefined) {
    for (const t of ts) if (s === t) return s as T
    throw new Error(`Unknown ENV value: ${s}`)
  }

  return s as T
}
