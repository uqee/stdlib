import { LoggerFn } from './LoggerFn'

export abstract class Logger {
  public abstract _1_error: LoggerFn
  public abstract _2_warning: LoggerFn
  public abstract _3_info: LoggerFn
  public abstract _4_debug: LoggerFn
  public abstract _5_trace: LoggerFn
  public abstract _6_spam: LoggerFn
}
