// https://github.com/microsoft/TypeScript/issues/34523
export function assertExhaustive(_n: never, message?: string): never {
  throw new Error(message)
}
