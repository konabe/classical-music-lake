import type { APIGatewayProxyHandler } from 'aws-lambda'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLE_LISTENING_LOGS } from '../utils/dynamodb'
import { ok, internalError } from '../utils/response'
import type { ListeningLog } from '../types'

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const result = await dynamo.send(
      new ScanCommand({ TableName: TABLE_LISTENING_LOGS })
    )
    const logs = (result.Items ?? []) as ListeningLog[]
    logs.sort((a, b) => b.listenedAt.localeCompare(a.listenedAt))
    return ok(logs)
  } catch (err) {
    return internalError(err)
  }
}
