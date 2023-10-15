import { writeFile } from 'node:fs/promises'
import { inspect } from 'node:util'

// https://nodejs.org/api/util.html#utilinspectobject-options
const inspectOptions: Parameters<typeof inspect>[1] = {
  breakLength: Infinity,
  colors: false,
  compact: Infinity,
  depth: Infinity,
  maxArrayLength: Infinity,
  maxStringLength: Infinity,
  numericSeparator: false,
  showHidden: false,
  showProxy: false,
  sorted: true,
}

export const fsWriteFile = (filename: string, data: unknown): Promise<void> => {
  return writeFile(filename, inspect(data, inspectOptions), { flag: 'w+' })
}
