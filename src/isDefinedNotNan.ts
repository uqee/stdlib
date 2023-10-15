export const isDefinedNotNan = <T>(t: T | undefined): t is T => {
  return t !== undefined && !(typeof t === 'number' && isNaN(t))
}
