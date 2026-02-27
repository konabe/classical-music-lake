import type { APIGatewayProxyHandler } from 'aws-lambda'
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLE_CONCERTS } from '../utils/dynamodb'
import { ok, notFound, badRequest, internalError } from '../utils/response'
import type { Concert, UpdateConcertInput } from '../types'

export const handler: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters?.id
  if (!id) return badRequest('id is required')
  if (!event.body) return badRequest('Request body is required')

  try {
    const existing = await dynamo.send(
      new GetCommand({ TableName: TABLE_CONCERTS, Key: { id } })
    )
    if (!existing.Item) return notFound('Concert not found')

    const input: UpdateConcertInput = JSON.parse(event.body)
    const updated: Concert = {
      ...(existing.Item as Concert),
      ...input,
      id,
      updatedAt: new Date().toISOString(),
    }
    await dynamo.send(new PutCommand({ TableName: TABLE_CONCERTS, Item: updated }))
    return ok(updated)
  } catch (err) {
    return internalError(err)
  }
}
