export type Unpromise<T extends Promise<unknown>> = T extends Promise<infer U> ? U : never
