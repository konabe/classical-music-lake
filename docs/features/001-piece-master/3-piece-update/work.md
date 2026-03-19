# ワーク3: 楽曲編集

## 概要

登録済み楽曲を編集する API とフロントエンドページを実装する。

## 実装内容

### バックエンド

- Lambda 関数 `backend/src/pieces/get.ts` を実装
  - `GET /pieces/{id}` → 指定 ID の楽曲を取得
- Lambda 関数 `backend/src/pieces/update.ts` を実装
  - `PUT /pieces/{id}` → `title`・`composer` を部分更新
  - 存在しない ID: `404 Not Found`
  - `updatedAt` を自動更新
- CDK に Lambda・API Gateway ルートを追加

### フロントエンド

- `pages/pieces/[id]/edit.vue` を実装
  - 既存の曲名・作曲家を初期値としてフォームに表示
  - 更新成功後に `/pieces` へリダイレクト
- `pages/pieces/index.vue` の編集ボタンを有効化

## 動作確認

- `PUT /pieces/{id}` で楽曲が更新され、一覧に反映されること
- `/pieces/{id}/edit` から編集して `/pieces` に戻れること
