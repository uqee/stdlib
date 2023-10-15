import { LogLevel } from './LogLevel'

export const toLogLevel = (logLevel: string): LogLevel => {
  return parseInt(logLevel, 10) as LogLevel
}
