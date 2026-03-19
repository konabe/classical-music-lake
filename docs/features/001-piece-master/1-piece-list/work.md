# ワーク1: 楽曲一覧

## 概要

楽曲マスタの基盤（DynamoDB テーブル・CDK 定義）を構築し、楽曲一覧の取得 API とフロントエンドページを実装する。

## 実装内容

### バックエンド

- DynamoDB テーブル `classical-music-pieces` を CDK で定義
  - パーティションキー: `id`（String）
  - 削除ポリシー: RETAIN
- Lambda 関数 `backend/src/pieces/list.ts` を実装
  - `GET /pieces` → 全楽曲を取得し `title` 昇順で返す
- CDK に Lambda・API Gateway ルートを追加

### フロントエンド

- `pages/pieces/index.vue` を実装
  - 楽曲一覧（曲名・作曲家）を表示
  - 編集・削除ボタンのプレースホルダーを配置（後続ワークで実装）

## 動作確認

- `GET /pieces` が空配列を返すこと
- `/pieces` ページに「まだ楽曲がありません」などの空状態が表示されること
