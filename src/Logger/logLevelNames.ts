import { LogLevel } from '../LogLevel'

export const logLevelNames: Record<LogLevel, string> = {
  [LogLevel._0_SILENT]: 'SILENT',
  [LogLevel._1_ERROR]: 'ERROR',
  [LogLevel._2_WARNING]: 'WARNING',
  [LogLevel._3_INFO]: 'INFO',
  [LogLevel._4_DEBUG]: 'DEBUG',
  [LogLevel._5_TRACE]: 'TRACE',
  [LogLevel._6_SPAM]: 'SPAM',
}
