import type { APIGatewayProxyHandler } from 'aws-lambda'
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLE_LISTENING_LOGS } from '../utils/dynamodb'
import { ok, notFound, badRequest, internalError } from '../utils/response'
import type { ListeningLog, UpdateListeningLogInput } from '../types'

export const handler: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters?.id
  if (!id) return badRequest('id is required')
  if (!event.body) return badRequest('Request body is required')

  try {
    const existing = await dynamo.send(
      new GetCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id } })
    )
    if (!existing.Item) return notFound('Listening log not found')

    const input: UpdateListeningLogInput = JSON.parse(event.body)
    const updated: ListeningLog = {
      ...(existing.Item as ListeningLog),
      ...input,
      id,
      updatedAt: new Date().toISOString(),
    }
    await dynamo.send(new PutCommand({ TableName: TABLE_LISTENING_LOGS, Item: updated }))
    return ok(updated)
  } catch (err) {
    return internalError(err)
  }
}
