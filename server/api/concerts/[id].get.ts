import { GetCommand } from '@aws-sdk/lib-dynamodb'
import type { Concert } from '~/types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig()
  const client = getDynamoClient()

  const result = await client.send(
    new GetCommand({
      TableName: config.dynamoTableConcerts,
      Key: { id },
    })
  )

  if (!result.Item) {
    throw createError({ statusCode: 404, message: 'Concert not found' })
  }

  return result.Item as Concert
})
