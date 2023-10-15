export type Unreadonly<T> = { -readonly [K in keyof T]: T[K] }
