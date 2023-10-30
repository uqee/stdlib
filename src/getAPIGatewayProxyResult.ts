import {
  APIGatewayProxyResult,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda'

import { isString } from './isString'

export const getAPIGatewayProxyResult = (
  // NB: it's not actually v2, there's simply no v1 version in types
  args?: Omit<Partial<APIGatewayProxyStructuredResultV2>, 'body'> & {
    body?: unknown
  },
): APIGatewayProxyResult => {
  const { body, statusCode, ...rest } = args ?? {}

  const response: APIGatewayProxyResult = {
    body:
      body === undefined ? '' : isString(body) ? body : JSON.stringify(body),
    statusCode: statusCode ?? 200,
    ...rest,
  }

  return response
}
