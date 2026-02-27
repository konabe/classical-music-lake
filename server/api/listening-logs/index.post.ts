import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'node:crypto'
import type { CreateListeningLogInput, ListeningLog } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateListeningLogInput>(event)
  const config = useRuntimeConfig()
  const client = getDynamoClient()

  const now = new Date().toISOString()
  const item: ListeningLog = {
    id: randomUUID(),
    ...body,
    createdAt: now,
    updatedAt: now,
  }

  await client.send(
    new PutCommand({
      TableName: config.dynamoTableListeningLogs,
      Item: item,
    })
  )

  return item
})
