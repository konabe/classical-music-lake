# ワーク2: 楽曲登録

## 概要

楽曲を新規登録する API とフロントエンドページを実装する。

## 実装内容

### バックエンド

- Lambda 関数 `backend/src/pieces/create.ts` を実装
  - `POST /pieces` → `title`・`composer` を受け取り DynamoDB に保存
  - バリデーション: `title`・`composer` は必須
  - 自動生成: `id`（UUID）・`createdAt`・`updatedAt`
- CDK に Lambda・API Gateway ルートを追加

### フロントエンド

- `pages/pieces/new.vue` を実装
  - 曲名・作曲家の入力フォーム
  - 登録成功後に `/pieces` へリダイレクト

## 動作確認

- `POST /pieces` で楽曲が登録され、`GET /pieces` の一覧に反映されること
- `/pieces/new` から登録して `/pieces` に戻れること
