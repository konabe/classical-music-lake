import type { APIGatewayProxyHandler } from 'aws-lambda'
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLE_CONCERTS } from '../utils/dynamodb'
import { ok, notFound, badRequest, internalError } from '../utils/response'
import type { Concert } from '../types'

export const handler: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters?.id
  if (!id) return badRequest('id is required')

  try {
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLE_CONCERTS, Key: { id } })
    )
    if (!result.Item) return notFound('Concert not found')
    return ok(result.Item as Concert)
  } catch (err) {
    return internalError(err)
  }
}
