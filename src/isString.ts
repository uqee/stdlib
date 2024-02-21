export const isString = <T extends string>(t: T | unknown): t is T => {
  return typeof t === 'string'
}
