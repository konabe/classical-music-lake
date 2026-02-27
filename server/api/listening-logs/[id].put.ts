import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import type { ListeningLog, UpdateListeningLogInput } from '~/types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<UpdateListeningLogInput>(event)
  const config = useRuntimeConfig()
  const client = getDynamoClient()

  const existing = await client.send(
    new GetCommand({
      TableName: config.dynamoTableListeningLogs,
      Key: { id },
    })
  )

  if (!existing.Item) {
    throw createError({ statusCode: 404, message: 'Listening log not found' })
  }

  const updated: ListeningLog = {
    ...(existing.Item as ListeningLog),
    ...body,
    id: id!,
    updatedAt: new Date().toISOString(),
  }

  await client.send(
    new PutCommand({
      TableName: config.dynamoTableListeningLogs,
      Item: updated,
    })
  )

  return updated
})
