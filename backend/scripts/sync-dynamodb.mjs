/**
 * prod → stg DynamoDB 同期スクリプト
 *
 * 対象テーブル:
 *   classical-music-listening-logs      → classical-music-listening-logs-stg
 *   classical-music-pieces              → classical-music-pieces-stg
 *
 * 使用方法:
 *   node backend/scripts/sync-dynamodb.mjs
 *
 * 必要な AWS 権限:
 *   dynamodb:Scan, dynamodb:BatchWriteItem (prod/stg 両テーブル)
 */

import { DynamoDBClient, ScanCommand, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = "ap-northeast-1";
const client = new DynamoDBClient({ region: REGION });

const TABLES = [
  {
    source: "classical-music-listening-logs",
    dest: "classical-music-listening-logs-stg",
    keyAttributes: ["id"],
  },
  {
    source: "classical-music-pieces",
    dest: "classical-music-pieces-stg",
    keyAttributes: ["id"],
  },
];

/**
 * テーブルの全アイテムをページネーションしながら取得する
 * @param {string} tableName
 * @returns {Promise<Record<string, import('@aws-sdk/client-dynamodb').AttributeValue>[]>}
 */
async function scanAll(tableName) {
  const items = [];
  let lastEvaluatedKey;

  do {
    const result = await client.send(
      new ScanCommand({
        TableName: tableName,
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
 * @param {string} tableName
 * @param {import('@aws-sdk/client-dynamodb').WriteRequest[]} writeRequests
 */
async function batchWrite(tableName, writeRequests) {
  const BATCH_SIZE = 25;

  for (let i = 0; i < writeRequests.length; i += BATCH_SIZE) {
    let unprocessed = writeRequests.slice(i, i + BATCH_SIZE);
    let retries = 0;

    while (unprocessed.length > 0) {
      const result = await client.send(
        new BatchWriteItemCommand({
          RequestItems: { [tableName]: unprocessed },
        })
      );

      unprocessed = result.UnprocessedItems?.[tableName] ?? [];

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

/**
 * ソーステーブルの全データをデスティネーションテーブルへ同期する
 * @param {string} sourceTable
 * @param {string} destTable
 * @param {string[]} keyAttributes
 */
async function syncTable(sourceTable, destTable, keyAttributes) {
  console.log(`\n=== ${sourceTable} → ${destTable} ===`);

  console.log("ソーステーブルをスキャン中...");
  const sourceItems = await scanAll(sourceTable);
  console.log(`  ${sourceItems.length} 件取得`);

  console.log("デスティネーションテーブルをスキャン中...");
  const destItems = await scanAll(destTable);
  console.log(`  ${destItems.length} 件取得`);

  if (destItems.length > 0) {
    console.log("デスティネーションの既存データを削除中...");
    const deleteRequests = destItems.map((item) => ({
      DeleteRequest: {
        Key: Object.fromEntries(keyAttributes.map((k) => [k, item[k]])),
      },
    }));
    await batchWrite(destTable, deleteRequests);
    console.log(`  ${destItems.length} 件削除完了`);
  }

  if (sourceItems.length > 0) {
    console.log("ソースデータをデスティネーションへ書き込み中...");
    const putRequests = sourceItems.map((item) => ({
      PutRequest: { Item: item },
    }));
    await batchWrite(destTable, putRequests);
    console.log(`  ${sourceItems.length} 件書き込み完了`);
  }
}

// メイン処理
for (const { source, dest, keyAttributes } of TABLES) {
  await syncTable(source, dest, keyAttributes);
}

console.log("\n=== 全テーブルの同期が完了しました ===");
