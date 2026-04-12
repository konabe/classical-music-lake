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

export const TABLE_CONCERT_LOGS = getEnv().dynamoTableConcertLogs;

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

/**
 * テーブル全件を Scan で取得する。
 *
 * @deprecated 新規コードでは {@link scanPage} を使ってカーソル型ページングを実装すること。
 * データ量が増えるとコスト・レイテンシが線形に悪化するため、将来的に削除予定。
 * 現状は `usePiecesAll` 経由の互換利用のみを想定する。
 */
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

/**
 * テーブルから 1 ページ分だけ Scan で取得する。カーソル型ページングの基礎プリミティブ。
 *
 * @param tableName 対象テーブル名
 * @param options.limit 取得件数の上限（DynamoDB の Limit パラメータ）
 * @param options.exclusiveStartKey 前ページの `lastEvaluatedKey`（先頭ページの場合は省略）
 */
export async function scanPage<T>(
  tableName: string,
  options: { limit: number; exclusiveStartKey?: Record<string, unknown> }
): Promise<{ items: T[]; lastEvaluatedKey?: Record<string, unknown> }> {
  const result = await dynamo.send(
    new ScanCommand({
      TableName: tableName,
      Limit: options.limit,
      ExclusiveStartKey: options.exclusiveStartKey,
    })
  );
  return {
    items: (result.Items ?? []) as T[],
    lastEvaluatedKey: result.LastEvaluatedKey as Record<string, unknown> | undefined,
  };
}

export async function updateItem<T extends { id: string; createdAt: string; updatedAt: string }>(
  tableName: string,
  id: string,
  input: Partial<T>
): Promise<T> {
  const existing = await dynamo.send(new GetCommand({ TableName: tableName, Key: { id } }));
  if (existing.Item === undefined) {
    throw new createError.NotFound("Item not found");
  }

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
