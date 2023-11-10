export type DefinedKeys<TObject extends object, TKey extends keyof TObject> = {
  [K in TKey]: TObject[K] extends infer T | undefined ? T : TObject[K]
}
