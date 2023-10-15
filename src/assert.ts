// https://github.com/microsoft/TypeScript/issues/34523
export function assert(condition: boolean, message?: string): asserts condition is true {
  if (!condition) throw new Error(message)
}
