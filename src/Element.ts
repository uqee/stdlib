export type Element<TArray extends readonly unknown[]> = //
  TArray extends readonly (infer TElement)[] ? TElement : never
