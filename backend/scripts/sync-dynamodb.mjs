/**
 * prod → stg DynamoDB 同期スクリプト
 *
 * 対象テーブル:
 *   classical-music-pieces    → classical-music-pieces-stg
 *   classical-music-composers → classical-music-composers-stg
 *
 * 視聴ログ（classical-music-listening-logs）・コンサート記録（classical-music-concert-logs）は
 * 個人情報を含むため同期対象外。
 *
 * 使用方法:
 *   node backend/scripts/sync-dynamodb.mjs
 *
 * 必要な AWS 権限:
 *   prod テーブル: dynamodb:Scan
 *   stg テーブル:  dynamodb:Scan, dynamodb:BatchWriteItem
 */

import { DynamoDBClient, ScanCommand, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = "ap-northeast-1";
const client = new DynamoDBClient({ region: REGION });

const TABLES = [
  {
    source: "classical-music-pieces",
    dest: "classical-music-pieces-stg",
    keyAttributes: ["id"],
  },
  {
    source: "classical-music-composers",
    dest: "classical-music-composers-stg",
    keyAttributes: ["id"],
  },
];

/**
 * テーブルの全アイテムをページネーションしながら取得する
 * @param {string} tableName
 * @param {string[] | undefined} projectionAttributes - 取得する属性名（省略時は全属性）
 */
async function scanAll(tableName, projectionAttributes) {
  const items = [];
  let lastEvaluatedKey;

  do {
    const params = {
      TableName: tableName,
      ExclusiveStartKey: lastEvaluatedKey,
    };
    if (projectionAttributes) {
      params.ProjectionExpression = projectionAttributes.join(", ");
    }

    const result = await client.send(new ScanCommand(params));
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
 * アイテムのキー文字列を生成する（差分削除の比較用）
 * @param {Record<string, import('@aws-sdk/client-dynamodb').AttributeValue>} item
 * @param {string[]} keyAttributes
 */
function itemKey(item, keyAttributes) {
  return keyAttributes
    .map((k) => {
      const v = item[k];
      return `${k}:${v?.S ?? v?.N ?? JSON.stringify(v)}`;
    })
    .join("#");
}

/**
 * ソーステーブルの全データをデスティネーションテーブルへ同期する
 *
 * 順序:
 *   1. source の全アイテムを dest へ upsert（先に書き込むことで部分失敗時の空化を防ぐ）
 *   2. dest にあって source にないキーのみ削除（差分削除）
 *
 * @param {string} sourceTable
 * @param {string} destTable
 * @param {string[]} keyAttributes
 * @param {((item: Record<string, import('@aws-sdk/client-dynamodb').AttributeValue>) => Record<string, import('@aws-sdk/client-dynamodb').AttributeValue>) | undefined} transform
 */
async function syncTable(sourceTable, destTable, keyAttributes, transform) {
  console.log(`\n=== ${sourceTable} → ${destTable} ===`);

  console.log("ソーステーブルをスキャン中...");
  const sourceItems = await scanAll(sourceTable);
  console.log(`  ${sourceItems.length} 件取得`);

  // dest はキーのみスキャンして差分計算に使う（転送データ量を削減）
  console.log("デスティネーションテーブルのキーをスキャン中...");
  const destItems = await scanAll(destTable, keyAttributes);
  console.log(`  ${destItems.length} 件取得`);

  // Step 1: source の全アイテムを dest に upsert
  if (sourceItems.length > 0) {
    console.log("デスティネーションへ書き込み中（upsert）...");
    const putItems = transform ? sourceItems.map(transform) : sourceItems;
    const putRequests = putItems.map((item) => ({
      PutRequest: { Item: item },
    }));
    await batchWrite(destTable, putRequests);
    console.log(`  ${sourceItems.length} 件書き込み完了`);
  }

  // Step 2: dest にあって source にないキーのみ削除
  if (destItems.length > 0) {
    const sourceKeySet = new Set(sourceItems.map((item) => itemKey(item, keyAttributes)));
    const deleteTargets = destItems.filter(
      (item) => !sourceKeySet.has(itemKey(item, keyAttributes))
    );

    if (deleteTargets.length > 0) {
      console.log(`差分削除: ${deleteTargets.length} 件を削除中...`);
      const deleteRequests = deleteTargets.map((item) => ({
        DeleteRequest: {
          Key: Object.fromEntries(keyAttributes.map((k) => [k, item[k]])),
        },
      }));
      await batchWrite(destTable, deleteRequests);
      console.log(`  ${deleteTargets.length} 件削除完了`);
    } else {
      console.log("  差分削除: 対象なし");
    }
  }
}

// メイン処理
for (const { source, dest, keyAttributes, transform } of TABLES) {
  await syncTable(source, dest, keyAttributes, transform);
}

console.log("\n=== 全テーブルの同期が完了しました ===");
