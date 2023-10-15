import { assertDefined } from './assertDefined'

export const envToInteger = <T extends number = number>(s: string | undefined, ts?: T[]): T => {
  assertDefined(s)

  const i: T = parseInt(s, 10) as T
  if (isNaN(i)) throw new Error(`Invalid ENV value: ${s}`)

  if (ts !== undefined) {
    for (const t of ts) if (i === t) return i
    throw new Error(`Unknown ENV value: ${s}`)
  }

  return i
}
