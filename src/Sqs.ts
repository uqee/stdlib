import type { SendMessageCommandInput, SendMessageCommandOutput } from '@aws-sdk/client-sqs'
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'

import { Integer } from './Integer'
import { isString } from './isString'
import { Logger } from './Logger'

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
    await this.logger._5_trace(
      () => `Sqs send input`,
      () => input,
    )

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

    await this.logger._6_spam(
      () => `Sqs send request`,
      () => request,
    )

    //

    const response: SendMessageCommandOutput = await this.sqsClient.send(
      new SendMessageCommand(request),
    )

    await this.logger._6_spam(
      () => `Sqs send response`,
      () => response,
    )

    //

    const output: SqsSendOutput = {}

    await this.logger._5_trace(
      () => `Sqs send output`,
      () => output,
    )

    return output
  }
}
