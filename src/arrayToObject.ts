type KeysOfType<TObject, TValue> = {
  [TKey in keyof TObject]: TObject[TKey] extends TValue ? TKey : never
}[keyof TObject]

export const arrayToObject = <TItem>(
  items: TItem[],
  key: KeysOfType<TItem, string>,
): Record<string, TItem> => {
  const result: Record<string, TItem> = {} as Record<string, TItem>
  for (const item of items) result[item[key] as string] = item
  return result
}
