import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import type { ListeningLog } from '~/types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const client = getDynamoClient()

  const result = await client.send(
    new ScanCommand({
      TableName: config.dynamoTableListeningLogs,
    })
  )

  const logs = (result.Items ?? []) as ListeningLog[]
  logs.sort((a, b) => b.listenedAt.localeCompare(a.listenedAt))

  return logs
})
