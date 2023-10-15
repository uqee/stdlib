import { assertDefined } from './assertDefined'

// https://github.com/microsoft/TypeScript/issues/34523
export function assertDefineds<T>(ts: (T | undefined)[], message?: string): asserts ts is T[] {
  for (const t of ts) assertDefined(t, message)
}
