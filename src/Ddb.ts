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
import { type Logger } from 'pino'

import { assertType } from './assertType'
import { Integer } from './Integer'
import { Timestamp } from './Timestamp'

//

export type DdbScalarTypes = boolean | null | number | string | undefined // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html

export type DdbItem = {
  [key: string]: DdbItem | DdbItem[] | DdbScalarTypes | DdbScalarTypes[]
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
    PARTITION_KEY: '_pk',
    SORT_KEY: '_sk',
    UPDATED: '_u',
  } as const

  public static ConditionCheck(
    _: Omit<ConditionCheck, 'Key'> & {
      Key: Record<string, unknown>
    },
  ): ConditionCheck {
    return { ..._, Key: marshall(_.Key, Ddb.MarshallOptions) }
  }

  public static Delete(
    _: Omit<Delete, 'Key'> & {
      Key: Record<string, unknown>
    },
  ): Delete {
    return Ddb.DeleteItemCommandInput(_) as Delete
  }

  private static DeleteItemCommandInput(
    _: Omit<DeleteItemCommandInput, 'Key'> & {
      Key: Record<string, unknown>
    },
  ): DeleteItemCommandInput {
    return { ..._, Key: marshall(_.Key, Ddb.MarshallOptions) }
  }

  public static Get(
    _: Omit<Get, 'Key'> & {
      Key: Record<string, unknown>
    },
  ): Get {
    return Ddb.GetItemCommandInput(_) as Get
  }

  private static GetItemCommandInput(
    _: Omit<GetItemCommandInput, 'Key'> & {
      Key: Record<string, unknown>
    },
  ): GetItemCommandInput {
    return { ..._, Key: marshall(_.Key, Ddb.MarshallOptions) }
  }

  private static MarshallOptions: MarshallOptions = {
    convertClassInstanceToMap: true,
    removeUndefinedValues: true,
  }

  public static Put(
    _: Omit<Put, 'Item'> & {
      Item: Record<string, unknown>
    },
  ): Put {
    return Ddb.PutItemCommandInput(_) as Put
  }

  private static PutItemCommandInput(
    _: Omit<PutItemCommandInput, 'Item'> & {
      Item: Record<string, unknown>
    },
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
    _: Omit<
      Update,
      'ExpressionAttributeNames' | 'ExpressionAttributeValues' | 'Key'
    > & {
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
    _.ExpressionAttributeNames[updatedAttributeName] =
      Ddb.AttributeNames.UPDATED

    _.ExpressionAttributeValues ??= {}
    if (
      !Object.prototype.hasOwnProperty.call(
        _.ExpressionAttributeValues,
        updatedAttributeValue,
      )
    ) {
      _.ExpressionAttributeValues[updatedAttributeValue] = timestamp
    }

    return {
      ..._,
      ExpressionAttributeValues: marshall(
        _.ExpressionAttributeValues,
        Ddb.MarshallOptions,
      ),
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

  public async batchGet<
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    TItems extends (unknown | undefined)[] = (unknown | undefined)[],
  >(
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
            Keys: _.RequestItems[key].Keys.map((Key) =>
              marshall(Key, Ddb.MarshallOptions),
            ),
          }
          return result
        },
        {} as Record<string, KeysAndAttributes>,
      ),
    }

    this.logger.trace({ input }, 'Ddb:batchGet:input')

    //

    const output: BatchGetItemCommandOutput =
      await this.dynamoDB.batchGetItem(input)

    this.logger.trace({ output }, 'Ddb:batchGet:output')

    //

    const result: Record<string, TItems> = {}
    if (output.Responses !== undefined) {
      for (const tableName of Object.keys(output.Responses)) {
        if (result[tableName] === undefined) {
          result[tableName] = [] as unknown as TItems
        }
        for (const response of output.Responses[tableName]) {
          result[tableName].push(unmarshall(response, Ddb.UnmarshallOptions))
        }
      }
    }

    this.logger.debug({ result }, 'Ddb:batchGet:result')

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

    this.logger.trace({ input }, 'Ddb:batchWrite:input')

    //

    const output: BatchWriteItemCommandOutput =
      await this.dynamoDB.batchWriteItem(input)

    this.logger.trace({ output }, 'Ddb:batchWrite:output')

    //

    const result: undefined = undefined

    this.logger.debug({ result }, 'Ddb:batchWrite:result')

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

    this.logger.trace({ input }, 'Ddb:delete:input')

    //

    const output: DeleteItemCommandOutput =
      await this.dynamoDB.deleteItem(input)

    this.logger.trace({ output }, 'Ddb:delete:output')

    //

    const result: undefined = undefined

    this.logger.debug({ result }, 'Ddb:delete:result')

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

    this.logger.trace({ input }, 'Ddb:get:input')

    //

    const output: GetItemCommandOutput = await this.dynamoDB.getItem(input)

    this.logger.trace({ output }, 'Ddb:get:output')

    //

    const result: TItem | undefined = output.Item //
      ? (unmarshall(output.Item, Ddb.UnmarshallOptions) as TItem)
      : undefined

    this.logger.debug({ result }, 'Ddb:get:result')

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

    this.logger.trace({ input }, 'Ddb:put:input')

    //

    const output: PutItemCommandOutput = await this.dynamoDB.putItem(input)

    this.logger.trace({ output }, 'Ddb:put:output')

    //

    const result: TItem | undefined =
      input.Item !== undefined //
        ? (unmarshall(input.Item, Ddb.UnmarshallOptions) as TItem)
        : undefined

    this.logger.debug({ result }, 'Ddb:put:result')

    //

    if (result === undefined) {
      throw new Error('result === undefined')
    }

    return { input, output, result }
  }

  public async query<
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    TItems extends (unknown | undefined)[] = (unknown | undefined)[],
  >(
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

      this.logger.trace({ input }, 'Ddb:query:input')

      inputs.push(input)

      //

      const output: QueryCommandOutput = await this.dynamoDB.query(input)

      this.logger.trace({ output }, 'Ddb:query:output')

      outputs.push(output)

      //

      const result: TItems = (output.Items ?? []).map((item) =>
        unmarshall(item, Ddb.UnmarshallOptions),
      ) as TItems

      this.logger.debug({ result }, 'Ddb:query:result')

      results.push(result)

      //

      ExclusiveStartKey = output.LastEvaluatedKey
      // eslint-disable-next-line no-unmodified-loop-condition
    } while (ExclusiveStartKey && autoPaginate)

    return { inputs, outputs, results }
  }

  public async scan<
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    TItems extends (unknown | undefined)[] = (unknown | undefined)[],
  >(
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

      this.logger.trace({ input }, 'Ddb:scan:input')

      inputs.push(input)

      //

      const output: ScanCommandOutput = await this.dynamoDB.scan(input)

      this.logger.trace({ output }, 'Ddb:scan:output')

      outputs.push(output)

      //

      const result: TItems = (output.Items ?? []).map((item) =>
        unmarshall(item, Ddb.UnmarshallOptions),
      ) as TItems

      this.logger.debug({ result }, 'Ddb:scan:result')

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

      this.logger.trace({ input }, 'Ddb:scanCount:input')

      inputs.push(input)

      //

      const output: ScanCommandOutput = await this.dynamoDB.scan(input)

      this.logger.trace({ output }, 'Ddb:scanCount:output')

      outputs.push(output)

      //

      const result: Integer = output.Count ?? 0

      this.logger.debug({ result }, 'Ddb:scanCount:result')

      results.push(result)

      //

      ExclusiveStartKey = output.LastEvaluatedKey
      // eslint-disable-next-line no-unmodified-loop-condition
    } while (ExclusiveStartKey && autoPaginate)

    return {
      inputs,
      outputs,
      result: results.reduce((sum, val) => sum + val, 0),
      results,
    }
  }

  public async transactGet<
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    TItems extends (unknown | undefined)[] = (unknown | undefined)[],
  >(
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

    this.logger.trace({ input }, 'Ddb:transactGet:input')

    //

    const output: TransactGetItemsCommandOutput = await this.dynamoDB.send(
      new TransactGetItemsCommand(input),
    )

    this.logger.trace({ output }, 'Ddb:transactGet:output')

    //

    const result: TItems = (output.Responses ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
      (itemResponse): unknown | undefined => {
        return itemResponse.Item !== undefined
          ? unmarshall(itemResponse.Item, Ddb.UnmarshallOptions)
          : undefined
      },
    ) as TItems

    this.logger.debug({ result }, 'Ddb:transactGet:result')

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

    this.logger.trace({ input }, 'Ddb:transactWrite:input')

    //

    const output: TransactWriteItemsCommandOutput = await this.dynamoDB.send(
      new TransactWriteItemsCommand(input),
    )

    this.logger.trace({ output }, 'Ddb:transactWrite:output')

    //

    const result: undefined = undefined

    this.logger.debug({ result }, 'Ddb:transactWrite:result')

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

    this.logger.trace({ input }, 'Ddb:update:input')

    //

    const output: UpdateItemCommandOutput =
      await this.dynamoDB.updateItem(input)

    this.logger.trace({ output }, 'Ddb:update:output')

    //

    const result: TItem = //
      unmarshall(output.Attributes ?? {}, Ddb.UnmarshallOptions) as TItem

    this.logger.debug({ result }, 'Ddb:update:result')

    //

    return { input, output, result }
  }
}

//

assertType<Record<string, keyof DdbMeta>>(Ddb.AttributeNames)
