import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";

import { getEnv } from "@/utils/env";

const client = new DynamoDBClient({ region: getEnv().awsRegion });

export const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const TABLE_LISTENING_LOGS = getEnv().dynamoTableListeningLogs;

export const TABLE_PIECES = getEnv().dynamoTablePieces;

export const TABLE_CONCERT_LOGS = getEnv().dynamoTableConcertLogs;

export const TABLE_COMPOSERS = getEnv().dynamoTableComposers;

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
      }),
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
      new ScanCommand({ TableName: tableName, ExclusiveStartKey: lastEvaluatedKey }),
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
  options: { limit: number; exclusiveStartKey?: Record<string, unknown> },
): Promise<{ items: T[]; lastEvaluatedKey?: Record<string, unknown> }> {
  const result = await dynamo.send(
    new ScanCommand({
      TableName: tableName,
      Limit: options.limit,
      ExclusiveStartKey: options.exclusiveStartKey,
    }),
  );
  return {
    items: (result.Items ?? []) as T[],
    lastEvaluatedKey: result.LastEvaluatedKey as Record<string, unknown> | undefined,
  };
}

/**
 * `updatedAt` による楽観的ロック付きで DynamoDB にアイテムを保存する。
 * 既存レコードの `updatedAt` が `prevUpdatedAt` と一致しない場合、
 * ConditionalCheckFailedException を 409 Conflict に変換して投げる。
 */
export async function putItemWithOptimisticLock<T>(options: {
  tableName: string;
  item: T;
  prevUpdatedAt: string;
  conflictMessage: string;
}): Promise<void> {
  try {
    await dynamo.send(
      new PutCommand({
        TableName: options.tableName,
        Item: options.item,
        ConditionExpression: "updatedAt = :prevUpdatedAt",
        ExpressionAttributeValues: { ":prevUpdatedAt": options.prevUpdatedAt },
      }),
    );
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      throw new createError.Conflict(options.conflictMessage);
    }
    throw err;
  }
}
