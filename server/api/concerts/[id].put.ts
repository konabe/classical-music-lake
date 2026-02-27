import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import type { Concert, UpdateConcertInput } from '~/types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<UpdateConcertInput>(event)
  const config = useRuntimeConfig()
  const client = getDynamoClient()

  const existing = await client.send(
    new GetCommand({
      TableName: config.dynamoTableConcerts,
      Key: { id },
    })
  )

  if (!existing.Item) {
    throw createError({ statusCode: 404, message: 'Concert not found' })
  }

  const updated: Concert = {
    ...(existing.Item as Concert),
    ...body,
    id: id!,
    updatedAt: new Date().toISOString(),
  }

  await client.send(
    new PutCommand({
      TableName: config.dynamoTableConcerts,
      Item: updated,
    })
  )

  return updated
})
