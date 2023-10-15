export const toString = <T>(t: T | undefined): string => {
  return t?.toString() ?? 'undefined'
}
