import type { APIGatewayProxyHandler } from 'aws-lambda'
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLE_LISTENING_LOGS } from '../utils/dynamodb'
import { ok, notFound, badRequest, internalError } from '../utils/response'
import type { ListeningLog } from '../types'

export const handler: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters?.id
  if (!id) return badRequest('id is required')

  try {
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id } })
    )
    if (!result.Item) return notFound('Listening log not found')
    return ok(result.Item as ListeningLog)
  } catch (err) {
    return internalError(err)
  }
}
