#!/usr/bin/env node
/**
 * ローカル DynamoDB テストデータシードスクリプト
 *
 * 前提: DynamoDB Local が起動済み、テーブルが作成済みであること
 * テーブル作成: node backend/scripts/setup-test-db.mjs
 *
 * 使い方:
 *   node backend/scripts/seed-test-db.mjs
 *
 * 環境変数:
 *   DYNAMO_TABLE_LISTENING_LOGS  テーブル名（デフォルト: classical-music-listening-logs）
 *   DYNAMODB_LOCAL_ENDPOINT      エンドポイント（デフォルト: http://localhost:8000）
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.DYNAMO_TABLE_LISTENING_LOGS ?? "classical-music-listening-logs";
const ENDPOINT = process.env.DYNAMODB_LOCAL_ENDPOINT ?? "http://localhost:8000";

const client = new DynamoDBClient({
  endpoint: ENDPOINT,
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const seedData = [
  {
    id: "seed-001",
    listenedAt: "2024-01-15T20:00:00.000Z",
    composer: "ベートーヴェン",
    piece: "交響曲第9番「合唱」",
    performer: "ベルリン・フィルハーモニー管弦楽団",
    conductor: "カラヤン",
    rating: 5,
    isFavorite: true,
    memo: "圧倒的な第4楽章",
    createdAt: "2024-01-15T21:00:00.000Z",
    updatedAt: "2024-01-15T21:00:00.000Z",
  },
  {
    id: "seed-002",
    listenedAt: "2024-01-10T15:00:00.000Z",
    composer: "モーツァルト",
    piece: "レクイエム",
    performer: "ウィーン・フィルハーモニー管弦楽団",
    conductor: "アーノンクール",
    rating: 4,
    isFavorite: false,
    memo: "荘厳な雰囲気",
    createdAt: "2024-01-10T16:00:00.000Z",
    updatedAt: "2024-01-10T16:00:00.000Z",
  },
  {
    id: "seed-003",
    listenedAt: "2024-01-05T18:00:00.000Z",
    composer: "バッハ",
    piece: "ゴルトベルク変奏曲",
    performer: "グレン・グールド",
    rating: 5,
    isFavorite: true,
    createdAt: "2024-01-05T19:00:00.000Z",
    updatedAt: "2024-01-05T19:00:00.000Z",
  },
  {
    id: "seed-004",
    listenedAt: "2024-01-08T20:00:00.000Z",
    composer: "ショパン",
    piece: "ピアノ協奏曲第1番",
    performer: "マルタ・アルゲリッチ",
    conductor: "デュトワ",
    rating: 4,
    isFavorite: false,
    createdAt: "2024-01-08T21:00:00.000Z",
    updatedAt: "2024-01-08T21:00:00.000Z",
  },
  {
    id: "seed-005",
    listenedAt: "2024-01-03T21:00:00.000Z",
    composer: "ブラームス",
    piece: "交響曲第4番",
    performer: "ウィーン・フィルハーモニー管弦楽団",
    conductor: "バーンスタイン",
    rating: 3,
    isFavorite: false,
    createdAt: "2024-01-03T22:00:00.000Z",
    updatedAt: "2024-01-03T22:00:00.000Z",
  },
];

async function deleteAll() {
  const scan = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
  const items = scan.Items ?? [];
  for (const item of items) {
    await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id: item.id } }));
  }
  console.log(`  既存データ削除: ${items.length}件`);
}

async function main() {
  console.log(`DynamoDB Local エンドポイント: ${ENDPOINT}`);
  console.log(`テーブル名: ${TABLE_NAME}`);
  console.log(`シードデータ: ${seedData.length}件`);
  console.log("");

  console.log("既存データを全件削除中...");
  await deleteAll();
  console.log("");

  for (const item of seedData) {
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    console.log(`  挿入完了: ${item.composer} - ${item.piece}`);
  }

  console.log("");
  console.log("シード完了");
}

try {
  await main();
} catch (e) {
  console.error("エラー:", e.message);
  process.exit(1);
}
