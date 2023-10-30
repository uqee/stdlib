import type {
  SendMessageCommandInput,
  SendMessageCommandOutput,
} from '@aws-sdk/client-sqs'
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import { Logger } from 'pino'

import { Integer } from './Integer'
import { isString } from './isString'

//

export interface SqsSendInput {
  delaySeconds?: Integer
  messageBody: object | string
  messageGroupId: string | undefined
  messageId: string | undefined
  queueUrl: string
}

export interface SqsSendOutput {}

//

export class Sqs {
  private readonly sqsClient: SQSClient

  public constructor(private readonly logger: Logger) {
    this.sqsClient = new SQSClient({})
  }

  public async send(input: SqsSendInput): Promise<SqsSendOutput> {
    this.logger.debug('Sqs send input %j', input)

    //

    const request: SendMessageCommandInput = {
      DelaySeconds: input.delaySeconds,
      MessageBody: isString(input.messageBody)
        ? input.messageBody
        : JSON.stringify(input.messageBody),
      MessageDeduplicationId: input.messageId,
      MessageGroupId: input.messageGroupId,
      QueueUrl: input.queueUrl,
    }

    this.logger.trace('Sqs send request %j', request)

    //

    const response: SendMessageCommandOutput = await this.sqsClient.send(
      new SendMessageCommand(request),
    )

    this.logger.trace('Sqs send response %j', response)

    //

    const output: SqsSendOutput = {}

    this.logger.debug('Sqs send output %j', output)

    return output
  }
}
