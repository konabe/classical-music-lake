import type { APIGatewayProxyHandler } from 'aws-lambda'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'
import { dynamo, TABLE_LISTENING_LOGS } from '../utils/dynamodb'
import { created, badRequest, internalError } from '../utils/response'
import type { CreateListeningLogInput, ListeningLog } from '../types'

export const handler: APIGatewayProxyHandler = async (event) => {
  if (!event.body) return badRequest('Request body is required')

  try {
    const input: CreateListeningLogInput = JSON.parse(event.body)
    const now = new Date().toISOString()
    const item: ListeningLog = {
      id: randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
    }
    await dynamo.send(new PutCommand({ TableName: TABLE_LISTENING_LOGS, Item: item }))
    return created(item)
  } catch (err) {
    return internalError(err)
  }
}
