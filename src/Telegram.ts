import { Logger } from 'pino'
import { Context, Telegraf } from 'telegraf'
import { Message } from 'typegram'

//

export interface TelegramSendInput {
  chatId: string | undefined
  message: string
}

export interface TelegramSendOutput {
  message: Message.TextMessage
}

//

export class Telegram {
  private static readonly SEND_MESSAGE_MARKUP_HTML: Parameters<
    Context['sendMessage']
  >['1'] = {
    parse_mode: 'HTML',
  }

  //

  private readonly chatId?: string
  private readonly telegraf: Telegraf

  public constructor(
    private readonly logger: Logger, //
    TG_BOT_TOKEN: string,
    TG_CHAT_ID?: string,
  ) {
    this.chatId = TG_CHAT_ID ? `${TG_CHAT_ID}` : undefined
    this.telegraf = new Telegraf(TG_BOT_TOKEN)
  }

  //

  public async send(input: TelegramSendInput): Promise<TelegramSendOutput> {
    this.logger.debug('Telegram send input %j', input)

    //

    const chatId: string | undefined = input.chatId ?? this.chatId
    if (chatId === undefined) throw new Error('chatId === undefined')

    const message: Message.TextMessage =
      await this.telegraf.telegram.sendMessage(
        chatId,
        input.message,
        Telegram.SEND_MESSAGE_MARKUP_HTML,
      )

    //

    const output: TelegramSendOutput = {
      message,
    }

    this.logger.debug('Telegram send output %j', output)

    //

    return output
  }
}
