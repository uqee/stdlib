// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LoggerFn = (...fns: Array<() => any>) => Promise<void>
