declare class Brand<TBrand> {
  private readonly __brand__: TBrand
}

export type Nominal<TBrand, TType> = Brand<TBrand> & TType
