/**
 * 未帰属視聴ログ削除スクリプト
 *
 * 認証導入前に作成された `userId` 属性を持たない / `userId = null` の
 * 視聴ログを削除する（Issue #297）。
 *
 * 使用方法:
 *   STAGE_NAME=dev node backend/scripts/cleanup-unclaimed-listening-logs.mjs
 *   STAGE_NAME=stg DRY_RUN=false node backend/scripts/cleanup-unclaimed-listening-logs.mjs
 *
 * 環境変数:
 *   STAGE_NAME  prod | stg | dev（必須）
 *   DRY_RUN     "false" のときのみ実削除。デフォルトはドライラン
 *
 * 必要な AWS 権限:
 *   dynamodb:Scan, dynamodb:BatchWriteItem
 */

import { DynamoDBClient, ScanCommand, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = "ap-northeast-1";
const client = new DynamoDBClient({ region: REGION });

const STAGE_NAME = process.env.STAGE_NAME;
const DRY_RUN = process.env.DRY_RUN !== "false";

if (!STAGE_NAME || !["prod", "stg", "dev"].includes(STAGE_NAME)) {
  console.error("::error::STAGE_NAME は prod | stg | dev のいずれかを指定してください");
  process.exit(1);
}

const TABLE_NAME =
  STAGE_NAME === "prod"
    ? "classical-music-listening-logs"
    : `classical-music-listening-logs-${STAGE_NAME}`;

/**
 * userId が存在しない、または null の視聴ログを全件取得する
 */
async function scanUnclaimed() {
  const items = [];
  let lastEvaluatedKey;

  do {
    const result = await client.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "attribute_not_exists(userId) OR userId = :null",
        ExpressionAttributeValues: { ":null": { NULL: true } },
        ProjectionExpression: "id",
        ExclusiveStartKey: lastEvaluatedKey,
      })
    );
    items.push(...(result.Items ?? []));
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return items;
}

/**
 * BatchWriteItem を 25 件ずつ送信する（UnprocessedItems は指数バックオフでリトライ）
 */
async function batchDelete(writeRequests) {
  const BATCH_SIZE = 25;

  for (let i = 0; i < writeRequests.length; i += BATCH_SIZE) {
    let unprocessed = writeRequests.slice(i, i + BATCH_SIZE);
    let retries = 0;

    while (unprocessed.length > 0) {
      const result = await client.send(
        new BatchWriteItemCommand({
          RequestItems: { [TABLE_NAME]: unprocessed },
        })
      );

      unprocessed = result.UnprocessedItems?.[TABLE_NAME] ?? [];

      if (unprocessed.length > 0) {
        retries++;
        if (retries > 5) {
          throw new Error(
            `BatchWriteItem: ${unprocessed.length} 件の処理に失敗しました（${retries} 回リトライ）`
          );
        }
        const waitMs = Math.pow(2, retries) * 100;
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }
}

console.log(`=== 未帰属視聴ログのクリーンアップ ===`);
console.log(`テーブル : ${TABLE_NAME}`);
console.log(`モード   : ${DRY_RUN ? "DRY RUN（削除しません）" : "実削除"}`);

console.log("\n未帰属アイテムをスキャン中...");
const unclaimed = await scanUnclaimed();
console.log(`  ${unclaimed.length} 件検出`);

if (unclaimed.length === 0) {
  console.log("\n削除対象はありません。");
  process.exit(0);
}

if (DRY_RUN) {
  console.log("\nDRY RUN のため削除は行いません。");
  console.log("対象 id（先頭 20 件）:");
  for (const item of unclaimed.slice(0, 20)) {
    console.log(`  - ${item.id?.S}`);
  }
  if (unclaimed.length > 20) {
    console.log(`  ... 他 ${unclaimed.length - 20} 件`);
  }
  process.exit(0);
}

console.log("\n削除を実行中...");
const deleteRequests = unclaimed.map((item) => ({
  DeleteRequest: { Key: { id: item.id } },
}));
await batchDelete(deleteRequests);
console.log(`  ${unclaimed.length} 件削除完了`);
console.log("\n=== 完了 ===");
