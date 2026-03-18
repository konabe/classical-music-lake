# 視聴ログ API 認証保護

## 概要

既存の視聴ログ API（Create / List / Get / Update / Delete）に認証チェックを追加し、認証されたユーザーのみが自分のログにアクセスできるようにする。

## スコープ

### バックエンド

- API Gateway に認証検証を追加（Authorizer）
  - リクエストの Authorization ヘッダーから JWT トークンを取得
  - トークンが有効かどうかを検証
  - Cognito でトークン検証を実施
- 各視聴ログ Lambda 関数（create/list/get/update/delete）に ユーザーID（sub）の埋め込み
  - DynamoDB テーブルに userId パーティションキーを追加（またはグローバルセカンダリインデックス）
  - 自分の視聴ログのみアクセス可能に

### フロントエンド

- API 呼び出し時に Authorization ヘッダーにトークンを付加
- 401/403 エラー時の処理（ログイン画面へリダイレクト）

## 前提条件

- AWS Cognito User Pool が セットアップ済み（タスク 3-1）
- ユーザーログイン機能が完了（タスク 3-3）
- 既存の視聴ログ API が動作中

## テストケース

### バックエンド

1. **Authorization Authorizer の実装**
   - JWT トークンが有効な場合: 認可
   - JWT トークンが無い場合: 401 Unauthorized
   - JWT トークンが無効な場合: 401 Unauthorized
   - JWT トークンが期限切れの場合: 401 Unauthorized

2. **ユーザーID の紐付け**
   - 視聴ログ作成時、トークンから取得した userId が記録される
   - userId が DynamoDB に保存される

3. **アクセス制御**
   - 自分の視聴ログは取得・編集・削除できる
   - 他ユーザーの視聴ログにはアクセスできない（403 Forbidden）
   - List API は自分のログのみ返却される

4. **エラーハンドリング**
   - 401/403 エラーに対して適切なエラーレスポンスを返す

### フロントエンド

1. **トークン付加**
   - 視聴ログ API 呼び出し時、Authorization ヘッダーに `Bearer {token}` が付加される

2. **エラーハンドリング**
   - 401 エラー時: ログイン画面へリダイレクト
   - 403 エラー時: エラーメッセージ表示

## 依存関係

- `3-1-aws-cognito-setup` (JWT 検証に必要)
- `3-3-user-login` (トークン取得に必要)
