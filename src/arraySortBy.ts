export const arraySortBy =
  <TObject extends object>(
    keys: Array<keyof TObject | { field: keyof TObject; desc?: boolean }>, //
    desc?: boolean,
  ) =>
  (objectA: TObject, objectB: TObject): number => {
    for (const key of keys) {
      const field = typeof key === 'object' ? key.field : key
      const descending = typeof key === 'object' ? key.desc : desc
      const valueA: TObject[keyof TObject] = objectA[field]
      const valueB: TObject[keyof TObject] = objectB[field]
      if (valueA > valueB || valueA < valueB) {
        const result: number = valueA > valueB ? 1 : -1
        return descending ? -result : result
      }
    }
    return 0
  }
