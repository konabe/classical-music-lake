import type { APIGatewayProxyHandler } from 'aws-lambda'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'
import { dynamo, TABLE_CONCERTS } from '../utils/dynamodb'
import { created, badRequest, internalError } from '../utils/response'
import type { Concert, CreateConcertInput } from '../types'

export const handler: APIGatewayProxyHandler = async (event) => {
  if (!event.body) return badRequest('Request body is required')

  try {
    const input: CreateConcertInput = JSON.parse(event.body)
    const now = new Date().toISOString()
    const item: Concert = {
      id: randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
    }
    await dynamo.send(new PutCommand({ TableName: TABLE_CONCERTS, Item: item }))
    return created(item)
  } catch (err) {
    return internalError(err)
  }
}
