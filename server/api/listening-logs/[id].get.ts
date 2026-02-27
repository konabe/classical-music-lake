import { GetCommand } from '@aws-sdk/lib-dynamodb'
import type { ListeningLog } from '~/types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig()
  const client = getDynamoClient()

  const result = await client.send(
    new GetCommand({
      TableName: config.dynamoTableListeningLogs,
      Key: { id },
    })
  )

  if (!result.Item) {
    throw createError({ statusCode: 404, message: 'Listening log not found' })
  }

  return result.Item as ListeningLog
})
