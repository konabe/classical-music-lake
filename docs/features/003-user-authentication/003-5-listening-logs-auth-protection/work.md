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
  - **DynamoDB テーブルスキーマ変更**: PK を `id`（UUID）のまま維持し、userId + createdAt の GSI（GSI1）を追加する
    - ユーザー別一覧取得（List）: GSI1（userId + createdAt）を使って Query
    - Get / Update / Delete: PK の `id` で GetItem し、取得後に `userId` を照合してアクセス制御
    - 想定クエリ例:
      - List: `Query(GSI1, KeyCondition: userId = :uid, SortKey: createdAt)`
      - Get: `GetItem(PK: id)` → `item.userId == requestUserId` を確認
  - 認可フロー: `event.requestContext.authorizer.claims.sub` から userId を取得し、DynamoDB クエリ条件またはアイテム照合に使用する
  - 自分の視聴ログのみアクセス可能に（他ユーザーのアイテムは 404 で返却）

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
   - 他ユーザーの視聴ログにはアクセスできない（404 Not Found で返却し、存在を隠蔽）
   - List API は自分のログのみ返却される

4. **エラーハンドリング**
   - 401/404 エラーに対して適切なエラーレスポンスを返す

### フロントエンド

1. **トークン付加**
   - 視聴ログ API 呼び出し時、Authorization ヘッダーに `Bearer {token}` が付加される

2. **エラーハンドリング**
   - 401 エラー時: ログイン画面へリダイレクト
   - 404 エラー時: エラーメッセージ表示

## 依存関係

- `003-1-aws-cognito-setup` (JWT 検証に必要)
- `003-3-user-login` (トークン取得に必要)
