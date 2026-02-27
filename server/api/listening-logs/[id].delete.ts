import { DeleteCommand } from '@aws-sdk/lib-dynamodb'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig()
  const client = getDynamoClient()

  await client.send(
    new DeleteCommand({
      TableName: config.dynamoTableListeningLogs,
      Key: { id },
    })
  )

  return { success: true }
})
