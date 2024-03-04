import type {
  SendMessageCommandInput,
  SendMessageCommandOutput,
} from '@aws-sdk/client-sqs'
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import { captureAWSv3Client } from 'aws-xray-sdk'
import { type Logger } from 'pino'

import { type Integer } from './Integer.js'
import { isString } from './isString.js'

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
    this.sqsClient = captureAWSv3Client(new SQSClient({}))
  }

  public async send(input: SqsSendInput): Promise<SqsSendOutput> {
    this.logger.debug({ input }, 'Sqs:send:input')

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

    this.logger.trace({ request }, 'Sqs:send:request')

    //

    const response: SendMessageCommandOutput = await this.sqsClient.send(
      new SendMessageCommand(request),
    )

    this.logger.trace({ response }, 'Sqs:send:response')

    //

    const output: SqsSendOutput = {}

    this.logger.debug({ output }, 'Sqs:send:output')

    return output
  }
}
