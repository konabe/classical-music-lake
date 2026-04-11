#!/usr/bin/env node
/**
 * ローカル DynamoDB テーブルのセットアップスクリプト
 *
 * 前提: DynamoDB Local が起動済みであること
 * 起動方法 (Docker):
 *   docker run -p 8000:8000 amazon/dynamodb-local
 *
 * 使い方:
 *   node backend/scripts/setup-test-db.mjs
 *
 * 環境変数:
 *   DYNAMO_TABLE_LISTENING_LOGS  テーブル名（デフォルト: classical-music-listening-logs）
 *   DYNAMODB_LOCAL_ENDPOINT      エンドポイント（デフォルト: http://localhost:8000）
 */

import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.DYNAMO_TABLE_LISTENING_LOGS ?? "classical-music-listening-logs";
const ENDPOINT = process.env.DYNAMODB_LOCAL_ENDPOINT ?? "http://localhost:8000";

const client = new DynamoDBClient({
  endpoint: ENDPOINT,
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
});

async function tableExists() {
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    return true;
  } catch (e) {
    if (e.name === "ResourceNotFoundException") {
      return false;
    }
    throw e;
  }
}

async function main() {
  console.log(`DynamoDB Local エンドポイント: ${ENDPOINT}`);
  console.log(`テーブル名: ${TABLE_NAME}`);

  if (await tableExists()) {
    console.log(`テーブルは既に存在します: ${TABLE_NAME}`);
    return;
  }

  await client.send(
    new CreateTableCommand({
      TableName: TABLE_NAME,
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
    })
  );

  console.log(`テーブルを作成しました: ${TABLE_NAME}`);
}

try {
  await main();
} catch (e) {
  console.error("エラー:", e.message);
  process.exit(1);
}
