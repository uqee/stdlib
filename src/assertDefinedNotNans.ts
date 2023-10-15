import { assertDefinedNotNan } from './assertDefinedNotNan'

// https://github.com/microsoft/TypeScript/issues/34523
export function assertDefinedNotNans<T>(
  ts: (T | undefined)[],
  message?: string,
): asserts ts is T[] {
  for (const t of ts) assertDefinedNotNan(t, message)
}
