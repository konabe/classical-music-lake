# ワーク4: 楽曲削除

## 概要

登録済み楽曲を削除する API と一覧ページの削除ボタンを実装する。

## 実装内容

### バックエンド

- Lambda 関数 `backend/src/pieces/delete.ts` を実装
  - `DELETE /pieces/{id}` → 指定 ID の楽曲を削除
  - レスポンス: `204 No Content`
- CDK に Lambda・API Gateway ルートを追加

### フロントエンド

- `pages/pieces/index.vue` の削除ボタンを有効化
  - 確認ダイアログを表示してから削除
  - 削除後に一覧を再取得して反映

## 動作確認

- `DELETE /pieces/{id}` で楽曲が削除され、一覧から消えること
- 確認ダイアログでキャンセルすると削除されないこと
