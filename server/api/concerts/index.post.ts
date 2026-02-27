import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'node:crypto'
import type { Concert, CreateConcertInput } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateConcertInput>(event)
  const config = useRuntimeConfig()
  const client = getDynamoClient()

  const now = new Date().toISOString()
  const item: Concert = {
    id: randomUUID(),
    ...body,
    createdAt: now,
    updatedAt: now,
  }

  await client.send(
    new PutCommand({
      TableName: config.dynamoTableConcerts,
      Item: item,
    })
  )

  return item
})
