import type {
  BatchGetItemCommandInput,
  BatchGetItemCommandOutput,
  BatchWriteItemCommandInput,
  BatchWriteItemCommandOutput,
  ConditionCheck,
  Delete,
  DeleteItemCommandInput,
  DeleteItemCommandOutput,
  Get,
  GetItemCommandInput,
  GetItemCommandOutput,
  KeysAndAttributes,
  Put,
  PutItemCommandInput,
  PutItemCommandOutput,
  QueryCommandInput,
  QueryCommandOutput,
  ScanCommandInput,
  ScanCommandOutput,
  TransactGetItemsCommandInput,
  TransactGetItemsCommandOutput,
  TransactWriteItemsCommandInput,
  TransactWriteItemsCommandOutput,
  Update,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
} from '@aws-sdk/client-dynamodb'
import {
  DynamoDB,
  TransactGetItemsCommand,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb'
import {
  marshall,
  type marshallOptions as MarshallOptions,
  unmarshall,
  type unmarshallOptions as UnmarshallOptions,
} from '@aws-sdk/util-dynamodb'

import { assertType } from './assertType'
import { Integer } from './Integer'
import { Logger } from './Logger'
import { Timestamp } from './Timestamp'

//

export type DdbScalarTypes = boolean | null | number | string | undefined // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html

export type DdbItem = {
  [key: number | string]: DdbItem | DdbScalarTypes
}

export type DdbMeta = {
  _c: Timestamp
  _pk: string
  _sk: string
  _u: Timestamp
}

//

export class Ddb {
  public static readonly AttributeNames = {
    CREATED: '_c',
    PRIMARY_KEY: '_pk',
    SORT_KEY: '_sk',
    UPDATED: '_u',
  } as const

  public static ConditionCheck(
    _: Omit<ConditionCheck, 'Key'> & { Key: Record<string, unknown> },
  ): ConditionCheck {
    return { ..._, Key: marshall(_.Key, Ddb.MarshallOptions) }
  }

  public static Delete(_: Omit<Delete, 'Key'> & { Key: Record<string, unknown> }): Delete {
    return Ddb.DeleteItemCommandInput(_) as Delete
  }

  private static DeleteItemCommandInput(
    _: Omit<DeleteItemCommandInput, 'Key'> & { Key: Record<string, unknown> },
  ): DeleteItemCommandInput {
    return { ..._, Key: marshall(_.Key, Ddb.MarshallOptions) }
  }

  public static Get(_: Omit<Get, 'Key'> & { Key: Record<string, unknown> }): Get {
    return Ddb.GetItemCommandInput(_) as Get
  }

  private static GetItemCommandInput(
    _: Omit<GetItemCommandInput, 'Key'> & { Key: Record<string, unknown> },
  ): GetItemCommandInput {
    return { ..._, Key: marshall(_.Key, Ddb.MarshallOptions) }
  }

  private static MarshallOptions: MarshallOptions = {
    convertClassInstanceToMap: true,
    removeUndefinedValues: true,
  }

  public static Put(_: Omit<Put, 'Item'> & { Item: Record<string, unknown> }): Put {
    return Ddb.PutItemCommandInput(_) as Put
  }

  private static PutItemCommandInput(
    _: Omit<PutItemCommandInput, 'Item'> & { Item: Record<string, unknown> },
  ): PutItemCommandInput {
    const timestamp: Timestamp = Date.now()

    const createdOwnProperty: boolean = //
      Object.prototype.hasOwnProperty.call(_.Item, Ddb.AttributeNames.CREATED)

    const updatedOwnProperty: boolean = //
      Object.prototype.hasOwnProperty.call(_.Item, Ddb.AttributeNames.UPDATED)

    return {
      ..._,
      ExpressionAttributeValues:
        _.ExpressionAttributeValues !== undefined
          ? marshall(_.ExpressionAttributeValues, Ddb.MarshallOptions)
          : undefined,
      Item: marshall(
        {
          ..._.Item,
          [Ddb.AttributeNames.CREATED]: createdOwnProperty
            ? _.Item[Ddb.AttributeNames.CREATED]
            : timestamp,
          [Ddb.AttributeNames.UPDATED]: updatedOwnProperty
            ? _.Item[Ddb.AttributeNames.UPDATED]
            : timestamp,
        },
        Ddb.MarshallOptions,
      ),
    }
  }

  private static UnmarshallOptions: UnmarshallOptions = {
    //
  }

  public static Update(
    _: Omit<Update, 'ExpressionAttributeNames' | 'ExpressionAttributeValues' | 'Key'> & {
      ExpressionAttributeNames?: Record<string, string>
      ExpressionAttributeValues?: Record<string, unknown>
      Key: Record<string, unknown>
    },
  ): Update {
    return Ddb.UpdateItemCommandInput(_) as Update
  }

  private static UpdateItemCommandInput(
    _: Omit<
      UpdateItemCommandInput,
      'ExpressionAttributeNames' | 'ExpressionAttributeValues' | 'Key'
    > & {
      ExpressionAttributeNames?: Record<string, string>
      ExpressionAttributeValues?: Record<string, unknown>
      Key: Record<string, unknown>
    },
  ): UpdateItemCommandInput {
    const timestamp: Timestamp = Date.now()

    const updatedAttributeName: string = `#${Ddb.AttributeNames.UPDATED}`
    const updatedAttributeValue: string = `:${Ddb.AttributeNames.UPDATED}`
    const updatedSet: string = `SET ${updatedAttributeName} = ${updatedAttributeValue}`

    _.ExpressionAttributeNames ??= {}
    _.ExpressionAttributeNames[updatedAttributeName] = Ddb.AttributeNames.UPDATED

    _.ExpressionAttributeValues ??= {}
    if (!Object.prototype.hasOwnProperty.call(_.ExpressionAttributeValues, updatedAttributeValue)) {
      _.ExpressionAttributeValues[updatedAttributeValue] = timestamp
    }

    return {
      ..._,
      ExpressionAttributeValues: marshall(_.ExpressionAttributeValues, Ddb.MarshallOptions),
      Key: marshall(_.Key, Ddb.MarshallOptions),
      ReturnConsumedCapacity: 'NONE',
      ReturnValues: 'ALL_NEW',
      UpdateExpression:
        _.ExpressionAttributeValues[updatedAttributeValue] !== undefined
          ? _.UpdateExpression?.includes('SET ')
            ? _.UpdateExpression.replace('SET ', `${updatedSet}, `)
            : _.UpdateExpression + ` ${updatedSet}`
          : _.UpdateExpression,
    }
  }

  //

  private readonly dynamoDB: DynamoDB

  public constructor(private readonly logger: Logger) {
    this.dynamoDB = new DynamoDB({})
  }

  //

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  public async batchGet<TItems extends (unknown | undefined)[] = (unknown | undefined)[]>(
    _: Omit<BatchGetItemCommandInput, 'RequestItems'> & {
      RequestItems: Record<
        string, // TableName
        Omit<KeysAndAttributes, 'Keys'> & {
          Keys: Partial<Record<keyof DdbMeta, DdbMeta[keyof DdbMeta]>>[]
        }
      >
    },
  ): Promise<{
    input: BatchGetItemCommandInput
    output: BatchGetItemCommandOutput
    result: Record<string, TItems>
  }> {
    //

    const input: BatchGetItemCommandInput = {
      ..._,
      RequestItems: Object.keys(_.RequestItems).reduce(
        (result, key) => {
          result[key] = {
            ..._.RequestItems[key],
            Keys: _.RequestItems[key].Keys.map((Key) => marshall(Key, Ddb.MarshallOptions)),
          }
          return result
        },
        {} as Record<string, KeysAndAttributes>,
      ),
    }

    await this.logger._6_spam(
      () => `Ddb batchGet input`,
      () => input,
    )

    //

    const output: BatchGetItemCommandOutput = await this.dynamoDB.batchGetItem(input)

    await this.logger._6_spam(
      () => `Ddb batchGet output`,
      () => output,
    )

    //

    const result: Record<string, TItems> = {}
    if (output.Responses !== undefined) {
      for (const tableName of Object.keys(output.Responses)) {
        if (result[tableName] === undefined) result[tableName] = [] as unknown as TItems
        for (const response of output.Responses[tableName]) {
          result[tableName].push(unmarshall(response, Ddb.UnmarshallOptions))
        }
      }
    }

    await this.logger._5_trace(
      () => `Ddb batchGet result`,
      () => result,
    )

    //

    return { input, output, result }
  }

  public async batchWrite(
    _: BatchWriteItemCommandInput, //
  ): Promise<{
    input: BatchWriteItemCommandInput
    output: BatchWriteItemCommandOutput
    result: undefined
  }> {
    //

    const input: BatchWriteItemCommandInput = _

    await this.logger._6_spam(
      () => `Ddb batchWrite input`,
      () => input,
    )

    //

    const output: BatchWriteItemCommandOutput = await this.dynamoDB.batchWriteItem(input)

    await this.logger._6_spam(
      () => `Ddb batchWrite output`,
      () => output,
    )

    //

    const result: undefined = undefined

    await this.logger._5_trace(
      () => `Ddb batchWrite result`,
      () => result,
    )

    //

    return { input, output, result }
  }

  public async delete(
    _: Omit<DeleteItemCommandInput, 'Key'> & { Key: Record<string, unknown> }, //
  ): Promise<{
    input: DeleteItemCommandInput
    output: DeleteItemCommandOutput
    result: undefined
  }> {
    //

    const input: DeleteItemCommandInput = Ddb.DeleteItemCommandInput(_)

    await this.logger._6_spam(
      () => `Ddb delete input`,
      () => input,
    )

    //

    const output: DeleteItemCommandOutput = await this.dynamoDB.deleteItem(input)

    await this.logger._6_spam(
      () => `Ddb delete output`,
      () => output,
    )

    //

    const result: undefined = undefined

    await this.logger._5_trace(
      () => `Ddb delete result`,
      () => result,
    )

    //

    return { input, output, result }
  }

  public async get<TItem extends DdbItem = DdbItem>(
    _: Omit<GetItemCommandInput, 'Key'> & { Key: Record<string, unknown> }, //
  ): Promise<{
    input: GetItemCommandInput
    output: GetItemCommandOutput
    result: TItem | undefined
  }> {
    //

    const input: GetItemCommandInput = Ddb.GetItemCommandInput(_)

    await this.logger._6_spam(
      () => `Ddb get input`,
      () => input,
    )

    //

    const output: GetItemCommandOutput = await this.dynamoDB.getItem(input)

    await this.logger._6_spam(
      () => `Ddb get output`,
      () => output,
    )

    //

    const result: TItem | undefined = output.Item //
      ? (unmarshall(output.Item, Ddb.UnmarshallOptions) as TItem)
      : undefined

    await this.logger._5_trace(
      () => `Ddb get result`,
      () => result,
    )

    //

    return { input, output, result }
  }

  public async put<TItem extends DdbItem = DdbItem>(
    _: Omit<PutItemCommandInput, 'Item'> & { Item: Record<string, unknown> }, //
  ): Promise<{
    input: PutItemCommandInput
    output: PutItemCommandOutput
    result: TItem
  }> {
    //

    const input: PutItemCommandInput = Ddb.PutItemCommandInput(_)

    await this.logger._6_spam(
      () => `Ddb put input`,
      () => input,
    )

    //

    const output: PutItemCommandOutput = await this.dynamoDB.putItem(input)

    await this.logger._6_spam(
      () => `Ddb put output`,
      () => output,
    )

    //

    const result: TItem | undefined =
      input.Item !== undefined //
        ? (unmarshall(input.Item, Ddb.UnmarshallOptions) as TItem)
        : undefined

    await this.logger._5_trace(
      () => `Ddb put result`,
      () => result,
    )

    //

    if (result === undefined) {
      throw new Error('result === undefined')
    }

    return { input, output, result }
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  public async query<TItems extends (unknown | undefined)[] = (unknown | undefined)[]>(
    _: Omit<QueryCommandInput, 'ExpressionAttributeValues'> & {
      autoPaginate?: boolean
      ExpressionAttributeValues?: Record<string, DdbScalarTypes>
    },
  ): Promise<{
    inputs: QueryCommandInput[]
    outputs: QueryCommandOutput[]
    results: TItems[]
  }> {
    const autoPaginate: boolean = _.autoPaginate ?? true
    const inputs: QueryCommandInput[] = []
    const outputs: QueryCommandOutput[] = []
    const results: TItems[] = []

    let ExclusiveStartKey: QueryCommandOutput['LastEvaluatedKey'] | undefined
    do {
      const input: QueryCommandInput = {
        ..._,
        ExclusiveStartKey,
        ExpressionAttributeValues: _.ExpressionAttributeValues
          ? marshall(_.ExpressionAttributeValues, Ddb.MarshallOptions)
          : undefined,
      }

      await this.logger._6_spam(
        () => `Ddb query input`,
        () => input,
      )

      inputs.push(input)

      //

      const output: QueryCommandOutput = await this.dynamoDB.query(input)

      await this.logger._6_spam(
        () => `Ddb query output`,
        () => output,
      )

      outputs.push(output)

      //

      const result: TItems = (output.Items ?? []).map((item) =>
        unmarshall(item, Ddb.UnmarshallOptions),
      ) as TItems

      await this.logger._5_trace(
        () => `Ddb query result`,
        () => result,
      )

      results.push(result)

      //

      ExclusiveStartKey = output.LastEvaluatedKey
      // eslint-disable-next-line no-unmodified-loop-condition
    } while (ExclusiveStartKey && autoPaginate)

    return { inputs, outputs, results }
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  public async scan<TItems extends (unknown | undefined)[] = (unknown | undefined)[]>(
    _: Omit<ScanCommandInput, 'ExpressionAttributeValues'> & {
      autoPaginate?: boolean
      ExpressionAttributeValues?: Record<string, DdbScalarTypes>
    },
  ): Promise<{
    inputs: ScanCommandInput[]
    outputs: ScanCommandOutput[]
    results: TItems[]
  }> {
    const autoPaginate: boolean = _.autoPaginate ?? true
    const inputs: ScanCommandInput[] = []
    const outputs: ScanCommandOutput[] = []
    const results: TItems[] = []

    let ExclusiveStartKey: ScanCommandOutput['LastEvaluatedKey'] | undefined
    do {
      const input: ScanCommandInput = {
        ..._,
        ExclusiveStartKey,
        ExpressionAttributeValues: _.ExpressionAttributeValues
          ? marshall(_.ExpressionAttributeValues, Ddb.MarshallOptions)
          : undefined,
      }

      await this.logger._6_spam(
        () => `Ddb scan input`,
        () => input,
      )

      inputs.push(input)

      //

      const output: ScanCommandOutput = await this.dynamoDB.scan(input)

      await this.logger._6_spam(
        () => `Ddb scan output`,
        () => output,
      )

      outputs.push(output)

      //

      const result: TItems = (output.Items ?? []).map((item) =>
        unmarshall(item, Ddb.UnmarshallOptions),
      ) as TItems

      await this.logger._5_trace(
        () => `Ddb scan result`,
        () => result,
      )

      results.push(result)

      //

      ExclusiveStartKey = output.LastEvaluatedKey
      // eslint-disable-next-line no-unmodified-loop-condition
    } while (ExclusiveStartKey && autoPaginate)

    return { inputs, outputs, results }
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  public async scanCount(
    _: Omit<ScanCommandInput, 'ExpressionAttributeValues' | 'Select'> & {
      autoPaginate?: boolean
      ExpressionAttributeValues?: Record<string, DdbScalarTypes>
    },
  ): Promise<{
    inputs: ScanCommandInput[]
    outputs: ScanCommandOutput[]
    result: Integer
    results: Integer[]
  }> {
    const autoPaginate: boolean = _.autoPaginate ?? true
    const inputs: ScanCommandInput[] = []
    const outputs: ScanCommandOutput[] = []
    const results: Integer[] = []

    let ExclusiveStartKey: ScanCommandOutput['LastEvaluatedKey'] | undefined
    do {
      const input: ScanCommandInput = {
        ..._,
        ExclusiveStartKey,
        ExpressionAttributeValues: _.ExpressionAttributeValues
          ? marshall(_.ExpressionAttributeValues, Ddb.MarshallOptions)
          : undefined,
        Select: 'COUNT',
      }

      await this.logger._6_spam(
        () => `Ddb scanCount input`,
        () => input,
      )

      inputs.push(input)

      //

      const output: ScanCommandOutput = await this.dynamoDB.scan(input)

      await this.logger._6_spam(
        () => `Ddb scanCount output`,
        () => output,
      )

      outputs.push(output)

      //

      const result: Integer = output.Count ?? 0

      await this.logger._5_trace(
        () => `Ddb scanCount result`,
        () => result,
      )

      results.push(result)

      //

      ExclusiveStartKey = output.LastEvaluatedKey
      // eslint-disable-next-line no-unmodified-loop-condition
    } while (ExclusiveStartKey && autoPaginate)

    return { inputs, outputs, result: results.reduce((sum, val) => sum + val, 0), results }
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  public async transactGet<TItems extends (unknown | undefined)[] = (unknown | undefined)[]>(
    _: TransactGetItemsCommandInput,
  ): Promise<{
    input: TransactGetItemsCommandInput
    output: TransactGetItemsCommandOutput
    result: TItems
  }> {
    //

    const input: TransactGetItemsCommandInput = {
      ReturnConsumedCapacity: 'NONE',
      ..._,
    }

    await this.logger._6_spam(
      () => `Ddb transactGet input`,
      () => input,
    )

    //

    const output: TransactGetItemsCommandOutput = await this.dynamoDB.send(
      new TransactGetItemsCommand(input),
    )

    await this.logger._6_spam(
      () => `Ddb transactGet output`,
      () => output,
    )

    //

    const result: TItems = (output.Responses ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
      (itemResponse): unknown | undefined => {
        return itemResponse.Item !== undefined
          ? unmarshall(itemResponse.Item, Ddb.UnmarshallOptions)
          : undefined
      },
    ) as TItems

    await this.logger._5_trace(
      () => `Ddb transactGet result`,
      () => result,
    )

    //

    return { input, output, result }
  }

  public async transactWrite(
    _: TransactWriteItemsCommandInput, //
  ): Promise<{
    input: TransactWriteItemsCommandInput
    output: TransactWriteItemsCommandOutput
    result: undefined
  }> {
    //

    const input: TransactWriteItemsCommandInput = {
      ReturnConsumedCapacity: 'NONE',
      ReturnItemCollectionMetrics: 'NONE',
      ..._,
    }

    await this.logger._6_spam(
      () => `Ddb transactWrite input`,
      () => input,
    )

    //

    const output: TransactWriteItemsCommandOutput = await this.dynamoDB.send(
      new TransactWriteItemsCommand(input),
    )

    await this.logger._6_spam(
      () => `Ddb transactWrite output`,
      () => output,
    )

    //

    const result: undefined = undefined

    await this.logger._5_trace(
      () => `Ddb transactWrite result`,
      () => result,
    )

    //

    return { input, output, result }
  }

  public async update<TItem extends DdbItem = DdbItem>(
    _: Omit<
      UpdateItemCommandInput,
      'ExpressionAttributeNames' | 'ExpressionAttributeValues' | 'Key'
    > & {
      ExpressionAttributeNames?: Record<string, string>
      ExpressionAttributeValues?: Record<string, unknown>
      Key: Record<string, unknown>
    },
  ): Promise<{
    input: UpdateItemCommandInput
    output: UpdateItemCommandOutput
    result: TItem
  }> {
    //

    const input: UpdateItemCommandInput = Ddb.UpdateItemCommandInput(_)

    await this.logger._6_spam(
      () => `Ddb update input`,
      () => input,
    )

    //

    const output: UpdateItemCommandOutput = await this.dynamoDB.updateItem(input)

    await this.logger._6_spam(
      () => `Ddb update output`,
      () => output,
    )

    //

    const result: TItem = //
      unmarshall(output.Attributes ?? {}, Ddb.UnmarshallOptions) as TItem

    await this.logger._5_trace(
      () => `Ddb update result`,
      () => result,
    )

    //

    return { input, output, result }
  }
}

//

assertType<Record<string, keyof DdbMeta>>(Ddb.AttributeNames)
