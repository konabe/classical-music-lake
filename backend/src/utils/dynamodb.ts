import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";

const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? "ap-northeast-1" });

export const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const TABLE_LISTENING_LOGS =
  process.env.DYNAMO_TABLE_LISTENING_LOGS ?? "classical-music-listening-logs";

export const TABLE_PIECES = process.env.DYNAMO_TABLE_PIECES ?? "classical-music-pieces";

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
  await dynamo.send(new PutCommand({ TableName: tableName, Item: updated }));
  return updated;
}
