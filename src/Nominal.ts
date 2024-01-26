const nominal = Symbol.for('nominal')

export type Nominal<TNominal, TType> = TType & {
  readonly [nominal]: TNominal
}
