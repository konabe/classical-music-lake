import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";

import { getEnv } from "./env";

const client = new DynamoDBClient({ region: getEnv().awsRegion });

export const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const TABLE_LISTENING_LOGS = getEnv().dynamoTableListeningLogs;

export const TABLE_PIECES = getEnv().dynamoTablePieces;

export async function queryItemsByUserId<T>(tableName: string, userId: string): Promise<T[]> {
  const items: T[] = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  do {
    const result = await dynamo.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: "GSI1",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId },
        ExclusiveStartKey: lastEvaluatedKey,
      })
    );
    items.push(...((result.Items ?? []) as T[]));
    lastEvaluatedKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastEvaluatedKey !== undefined);

  return items;
}

export async function scanAllItems<T>(tableName: string): Promise<T[]> {
  const items: T[] = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  do {
    const result = await dynamo.send(
      new ScanCommand({ TableName: tableName, ExclusiveStartKey: lastEvaluatedKey })
    );
    items.push(...((result.Items ?? []) as T[]));
    lastEvaluatedKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastEvaluatedKey !== undefined);

  return items;
}

export async function getItemByOwner<T extends { userId: string }>(
  tableName: string,
  id: string,
  userId: string
): Promise<T> {
  const result = await dynamo.send(new GetCommand({ TableName: tableName, Key: { id } }));
  const item = result.Item as T | undefined;
  if (!item || item.userId !== userId) {
    throw new createError.NotFound("Item not found");
  }
  return item;
}

export async function updateItem<T extends { id: string; createdAt: string; updatedAt: string }>(
  tableName: string,
  id: string,
  input: Partial<T>
): Promise<T> {
  const existing = await dynamo.send(new GetCommand({ TableName: tableName, Key: { id } }));
  if (!existing.Item) throw new createError.NotFound("Item not found");

  const current = existing.Item as T;
  const updated: T = {
    ...current,
    ...input,
    id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };
  try {
    await dynamo.send(
      new PutCommand({
        TableName: tableName,
        Item: updated,
        ConditionExpression: "updatedAt = :prevUpdatedAt",
        ExpressionAttributeValues: { ":prevUpdatedAt": current.updatedAt },
      })
    );
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      throw new createError.Conflict("Item was updated by another request");
    }
    throw err;
  }
  return updated;
}
