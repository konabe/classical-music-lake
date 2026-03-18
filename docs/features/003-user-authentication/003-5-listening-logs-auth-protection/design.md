# 視聴ログ API 認証保護 - 設計書

## 概要

既存の視聴ログ API（Create / List / Get / Update / Delete）に認証チェックを追加し、認証されたユーザーのみが自分のログにアクセスできるようにする。

## システムフロー

```
フロントエンド
    ↓
API 呼び出し（Authorization ヘッダーに JWT トークン）
    ↓
API Gateway
    ↓
[Cognito Authorizer]
    - JWT トークン検証
    - トークン有効期限確認
    - ユーザー ID（sub）抽出
    ↓
Lambda 関数
    ↓
[ユーザー ID を Lambda コンテキストから取得]
    ↓
DynamoDB
    ↓
[自分のデータのみフィルタリング]
    ↓
レスポンス返却
```

## API Gateway 設計

### Authorizer の設定

**Cognito User Pool Authorizer**:

- User Pool: 3-1 で作成した Cognito User Pool
- Token Source: `Authorization` ヘッダー
- Validation Expression: `^Bearer [-0-9a-zA-z\.]*$`

### 認可フロー

```
ステップ 1: JWT トークン取得
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

ステップ 2: Cognito Authorizer が検証
  - 署名確認
  - 有効期限確認
  - ユーザー ID（sub）抽出

ステップ 3: Lambda にコンテキスト渡す
  event.requestContext.authorizer.sub → ユーザー ID

ステップ 4: Lambda が自分のデータのみ処理
```

### エンドポイント設定

すべての視聴ログエンドポイントに Cognito Authorizer を適用:

| メソッド | パス                   | Authorizer          |
| -------- | ---------------------- | ------------------- |
| POST     | `/listening-logs`      | Cognito User Pool ✓ |
| GET      | `/listening-logs`      | Cognito User Pool ✓ |
| GET      | `/listening-logs/{id}` | Cognito User Pool ✓ |
| PUT      | `/listening-logs/{id}` | Cognito User Pool ✓ |
| DELETE   | `/listening-logs/{id}` | Cognito User Pool ✓ |

## バックエンド設計

### DynamoDB スキーマ変更

#### 既存スキーマ

```
テーブル: ListeningLogs
パーティションキー: id（UUID）
ソートキー: （なし）
属性: piece, performance, rating, memo, createdAt, updatedAt
```

#### 新スキーマ（変更）

```
テーブル: ListeningLogs
パーティションキー: userId（Cognito sub）
ソートキー: createdAt（ISO 8601）
グローバルセカンダリインデックス (GSI):
  - パーティションキー: userId
  - ソートキー: createdAt
    （実質的に同じだが、クエリ柔軟性向上）
属性: id (UUID), userId, piece, performance, rating, memo, createdAt, updatedAt
```

**背景**: 既存は id（UUID）をパーティションキーとしていたが、ユーザーごとのアクセス制御のため userId をパーティションキーに変更。

### Lambda 関数の変更

#### 各操作での処理パターン

**Create (POST /listening-logs)**:

```
1. Authorization ヘッダーから JWT 抽出
2. API Gateway Authorizer が検証、sub をコンテキストに埋め込み
3. Lambda が event.requestContext.authorizer.sub から userId を取得
4. リクエストボディの piece, performance 等から新しいドキュメントを作成
5. userId と createdAt をドキュメントに追加
6. DynamoDB に保存（パーティションキー: userId, ソートキー: createdAt）
7. 201 Created + ドキュメント返却
```

**List (GET /listening-logs)**:

```
1. userId を取得
2. Query: userId でパーティション内のすべてのアイテムを取得
3. 自動的に自分のログのみ返却
```

**Get (GET /listening-logs/{id})**:

```
1. userId を取得
2. Query: userId と createdAt（id から抽出またはリクエストから受け取り）で検索
3. マッチしたアイテムのみ返却（他ユーザーのアイテムは 404）
```

**Update (PUT /listening-logs/{id})**:

```
1. userId を取得
2. 既存アイテムが自分のものか確認（userId 一致確認）
3. 一致しない場合は 403 Forbidden
4. 更新・保存
```

**Delete (DELETE /listening-logs/{id})**:

```
1. userId を取得
2. 既存アイテムが自分のものか確認
3. 一致しない場合は 403 Forbidden
4. 削除
```

### エラーハンドリング

| シナリオ                       | HTTP ステータス  | レスポンス                                                                    |
| ------------------------------ | ---------------- | ----------------------------------------------------------------------------- |
| Authorization ヘッダーなし     | 401 Unauthorized | API Gateway が自動返却                                                        |
| JWT 無効                       | 401 Unauthorized | API Gateway が自動返却                                                        |
| JWT 期限切れ                   | 401 Unauthorized | API Gateway が自動返却                                                        |
| 他ユーザーのアイテムにアクセス | 403 Forbidden    | `{ error: "Forbidden", message: "You do not have access to this resource." }` |
| アイテムが見つからない         | 404 Not Found    | `{ error: "NotFound", message: "..." }`                                       |

## フロントエンド設計

### API 呼び出し

**Composable**: `composables/useApiBase.ts`（既存）を拡張

```
- API 呼び出し時に自動的に Authorization ヘッダーを付加
  - ヘッダー形式: Authorization: Bearer {token}
  - token は localStorage から取得
```

### エラーハンドリング

**401 エラー時**:

- トークン期限切れの可能性
- localStorage からトークン削除
- ログイン画面へリダイレクト
- 「セッションが切れました。再度ログインしてください。」メッセージ表示

**403 エラー時**:

- 権限なしの可能性
- エラーメッセージ表示（「このアイテムにアクセスする権限がありません。」）

## マイグレーション戦略

### 既存データの扱い

- 既存の視聴ログには userId がないため、デプロイ時にすべてのレコードをマイグレーション
- マイグレーション方式:
  1. デプロイ前に全データをバックアップ
  2. Lambda または CDK のカスタムリソースでマイグレーション実行
  3. 各レコードに userId（デフォルトユーザー ID など）を割り当て
  4. 検証後、旧データ削除

### 事前準備

- デプロイ前: DynamoDB テーブルの自動バックアップ有効化
- 本番デプロイ: ステージング環境で検証後に実施

## セキュリティ考慮事項

### 実装予定

- API Gateway Authorizer による JWT 検証
- ユーザー ID ベースのアクセス制御
- HTTPS のみ
- CORS: フロントエンドドメインのみ許可

### 実装しない

- 監査ログ（将来フェーズ）
- IP ホワイトリスト（将来フェーズ）

## トレードオフ・判断理由

| 項目                           | 選択                       | 理由                                           |
| ------------------------------ | -------------------------- | ---------------------------------------------- |
| **パーティションキー変更**     | userId                     | アクセス制御とスケーラビリティ向上             |
| **既存データマイグレーション** | CDK カスタムリソース       | 自動化、デプロイ時に実行                       |
| **404 vs 403**                 | 他ユーザーのアイテム = 403 | セキュリティ（アイテム存在推測防止）と UX 両立 |

## レビュー結果

（レビュー後に記載）
