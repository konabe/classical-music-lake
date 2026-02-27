import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'ap-northeast-1' })

export const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})

export const TABLE_LISTENING_LOGS =
  process.env.DYNAMO_TABLE_LISTENING_LOGS ?? 'classical-music-listening-logs'

export const TABLE_CONCERTS =
  process.env.DYNAMO_TABLE_CONCERTS ?? 'classical-music-concerts'
