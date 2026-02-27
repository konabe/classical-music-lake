import type { APIGatewayProxyHandler } from 'aws-lambda'
import { DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLE_CONCERTS } from '../utils/dynamodb'
import { noContent, badRequest, internalError } from '../utils/response'

export const handler: APIGatewayProxyHandler = async (event) => {
  const id = event.pathParameters?.id
  if (!id) return badRequest('id is required')

  try {
    await dynamo.send(new DeleteCommand({ TableName: TABLE_CONCERTS, Key: { id } }))
    return noContent()
  } catch (err) {
    return internalError(err)
  }
}
