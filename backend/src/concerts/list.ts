import type { APIGatewayProxyHandler } from 'aws-lambda'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLE_CONCERTS } from '../utils/dynamodb'
import { ok, internalError } from '../utils/response'
import type { Concert } from '../types'

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const result = await dynamo.send(new ScanCommand({ TableName: TABLE_CONCERTS }))
    const concerts = (result.Items ?? []) as Concert[]
    concerts.sort((a, b) => b.date.localeCompare(a.date))
    return ok(concerts)
  } catch (err) {
    return internalError(err)
  }
}
