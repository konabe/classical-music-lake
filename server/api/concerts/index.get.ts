import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import type { Concert } from '~/types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const client = getDynamoClient()

  const result = await client.send(
    new ScanCommand({
      TableName: config.dynamoTableConcerts,
    })
  )

  const concerts = (result.Items ?? []) as Concert[]
  concerts.sort((a, b) => b.date.localeCompare(a.date))

  return concerts
})
