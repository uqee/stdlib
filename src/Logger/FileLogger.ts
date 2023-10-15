import { appendFile, writeFileSync } from 'node:fs'
import { inspect } from 'node:util'

import { isPrimitive } from '../isPrimitive'
import { LogLevel } from '../LogLevel'
import { dateToString } from './dateToString'
import { Logger } from './Logger'
import { LoggerFn } from './LoggerFn'
import { logLevelNames } from './logLevelNames'

export class FileLogger implements Logger {
  // https://nodejs.org/api/util.html#utilinspectobject-options
  private static readonly inspectOptions: Parameters<typeof inspect>[1] = {
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

  //

  public constructor(
    private readonly logLevel: LogLevel,
    private readonly filename: string = 'console.log',
    private readonly showDate?: boolean,
    private readonly showLevel?: boolean,
  ) {
    writeFileSync(this.filename, '')
  }

  public _1_error = this.getLoggerFn(LogLevel._1_ERROR)
  public _2_warning = this.getLoggerFn(LogLevel._2_WARNING)
  public _3_info = this.getLoggerFn(LogLevel._3_INFO)
  public _4_debug = this.getLoggerFn(LogLevel._4_DEBUG)
  public _5_trace = this.getLoggerFn(LogLevel._5_TRACE)
  public _6_spam = this.getLoggerFn(LogLevel._6_SPAM)

  //

  private getLoggerFn(logLevel: LogLevel): LoggerFn {
    const loggerFn: LoggerFn = async (...fns) => {
      if (this.logLevel < logLevel) return
      return new Promise((resolve, reject) => {
        //

        let line: string = ''

        if (this.showDate) line += ' ' + dateToString(new Date())
        if (this.showLevel) line += ' ' + logLevelNames[logLevel]

        for (const fn of fns) {
          const value: unknown = fn()
          line +=
            ' ' +
            (isPrimitive(value)
              ? `${value?.toString() ?? 'undefined'}` //
              : inspect(value, FileLogger.inspectOptions))
        }

        line = line.substring(1) + '\n'

        //

        appendFile(this.filename, line, (error) => (error ? reject(error) : resolve()))
      })
    }
    return loggerFn
  }
}
