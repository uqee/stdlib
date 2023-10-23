/* eslint-disable no-redeclare */

import { Integer } from './Integer'
import { LogLevel } from './LogLevel'

export function toLogLevel(logLevel: undefined): undefined
export function toLogLevel(logLevel: string): LogLevel
export function toLogLevel(logLevel: string | undefined): LogLevel | undefined {
  if (logLevel === undefined) return undefined

  const i: Integer = parseInt(logLevel, 10)
  if (Number.isNaN(i)) return undefined

  return Math.max(
    Math.min(i, LogLevel._6_SPAM), //
    LogLevel._0_SILENT,
  ) as LogLevel
}
