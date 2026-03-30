# 視聴ログ API 認証保護 - 設計書

## 概要

既存の視聴ログ API（Create / List / Get / Update / Delete）に認証チェックを追加し、認証されたユーザーのみが自分のログにアクセスできるようにする。

## システムフロー

```text
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

```text
ステップ 1: JWT トークン取得
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

ステップ 2: Cognito Authorizer が検証
  - 署名確認
  - 有効期限確認
  - ユーザー ID（sub）抽出

ステップ 3: Lambda にコンテキスト渡す
  event.requestContext.authorizer.claims.sub → ユーザー ID
  （Cognito Authorizer 設定では sub は authorizer.claims オブジェクト内に格納される）

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

```text
テーブル: ListeningLogs
パーティションキー: id（UUID）
ソートキー: （なし）
属性: piece, performance, rating, memo, createdAt, updatedAt
```

#### 新スキーマ（変更）

```text
テーブル: ListeningLogs
パーティションキー: id（UUID）← PK は id のまま維持
ソートキー: （なし）
グローバルセカンダリインデックス (GSI1):
  - パーティションキー: userId（Cognito sub）
  - ソートキー: createdAt（ISO 8601）
属性: id (UUID), userId, piece, performance, rating, memo, createdAt, updatedAt
```

**背景・設計理由**:

- `/listening-logs/{id}` の Get / Update / Delete は PK の `id`（UUID）で一意解決する。`PK=userId, SK=createdAt` では id による一意解決ができないため、PK は `id` を維持する。
- ユーザー別の一覧取得（List）は GSI1（userId + createdAt）を使ってクエリする。
- Get / Update / Delete は PK の `id` で直接検索し、取得後に `userId` を照合してアクセス制御を行う。

### Lambda 関数の変更

#### 各操作での処理パターン

**Create (POST /listening-logs)**:

```text
1. Authorization ヘッダーから JWT 抽出
2. API Gateway Authorizer が検証、sub をコンテキストに埋め込み
3. Lambda が event.requestContext.authorizer.claims.sub から userId を取得
4. リクエストボディの piece, performance 等から新しいドキュメントを作成
5. id（UUID）を生成し、userId と createdAt をドキュメントに追加
6. DynamoDB に保存（PK: id）
7. 201 Created + ドキュメント返却
```

**List (GET /listening-logs)**:

```text
1. event.requestContext.authorizer.claims.sub から userId を取得
2. GSI1 を使って Query: userId でユーザーのすべてのアイテムを取得（ソートキー: createdAt）
3. 自動的に自分のログのみ返却
```

**Get (GET /listening-logs/{id})**:

```text
1. event.requestContext.authorizer.claims.sub から userId を取得
2. GetItem: PK の id（UUID）で直接検索
3. 取得したアイテムの userId と リクエストの userId を照合
4. 一致しない場合（他ユーザーのアイテム）は 404 Not Found（存在を隠蔽）
5. 一致した場合のみアイテムを返却
```

**Update (PUT /listening-logs/{id})**:

```text
1. event.requestContext.authorizer.claims.sub から userId を取得
2. GetItem: PK の id（UUID）で既存アイテムを取得
3. 取得したアイテムの userId と リクエストの userId を照合
4. 一致しない場合は 404 Not Found（存在を隠蔽）
5. 更新・保存
```

**Delete (DELETE /listening-logs/{id})**:

```text
1. event.requestContext.authorizer.claims.sub から userId を取得
2. GetItem: PK の id（UUID）で既存アイテムを取得
3. 取得したアイテムの userId と リクエストの userId を照合
4. 一致しない場合は 404 Not Found（存在を隠蔽）
5. 削除
```

### エラーハンドリング

| シナリオ                       | HTTP ステータス  | レスポンス                                                                                                                       |
| ------------------------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Authorization ヘッダーなし     | 401 Unauthorized | API Gateway が自動返却                                                                                                           |
| JWT 無効                       | 401 Unauthorized | API Gateway が自動返却                                                                                                           |
| JWT 期限切れ                   | 401 Unauthorized | API Gateway が自動返却                                                                                                           |
| 他ユーザーのアイテムにアクセス | 404 Not Found    | `{ error: "NotFound", message: "The requested resource was not found." }` （存在を隠蔽し、他ユーザーのリソース存在の推測を防止） |
| アイテムが見つからない         | 404 Not Found    | `{ error: "NotFound", message: "..." }`                                                                                          |

## フロントエンド設計

### API 呼び出し

**Composable**: `composables/useApiBase.ts`（既存）を拡張

```text
- API 呼び出し時に自動的に Authorization ヘッダーを付加
  - ヘッダー形式: Authorization: Bearer {token}
  - token は Cookie から取得（useApiBase が一元管理）
```

### エラーハンドリング

**401 エラー時**:

- トークン期限切れの可能性
- Cookie と localStorage のトークンを削除
- ログイン画面へリダイレクト
- 「セッションが切れました。再度ログインしてください。」メッセージ表示

**404 エラー時**（他ユーザーリソースへのアクセス含む）:

- リソースが存在しないか、アクセス権限がない可能性
- エラーメッセージ表示（「お探しのアイテムは見つかりませんでした。」）

## マイグレーション戦略

### 既存データの扱い

**採用方式: `userId=null`（未帰属）としてマイグレーション**

既存の視聴ログには userId がないため、`userId=null`（未帰属）としてマイグレーションする。未帰属データは通常ユーザーには非表示とし、将来的に管理者専用移管フロー（監査証跡付き）で特定ユーザーへの帰属を行う。

- マイグレーション手順:
  1. デプロイ前に全データをバックアップ（DynamoDB の Point-in-Time Recovery 有効化）
  2. Lambda または CDK のカスタムリソースでマイグレーション実行
  3. 各レコードの `userId` を `null` に設定（デフォルトユーザー ID は割り当てない）
  4. 通常ユーザー向けの List / Get / Update / Delete では `userId != null` かつ `userId == リクエストユーザー` の条件でフィルタリング
  5. バリデーション: マイグレーション後、全レコードの `id`（UUID）が一意であること・既存属性（piece, performance 等）が欠損していないことを確認
  6. クリーンアップ: 検証完了後、不要なバックアップデータを削除

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

| 項目                           | 選択                                             | 理由                                                                                       |
| ------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **パーティションキー**         | id（UUID）を維持、userId+createdAt の GSI を追加 | Get/Update/Delete の一意解決に id が必要。ユーザー別検索は GSI で対応                      |
| **既存データマイグレーション** | userId=null（未帰属）として保持                  | デフォルトユーザー割り当ては責任の所在が不明確。未帰属として管理者フローで移管する方が安全 |
| **404 vs 403**                 | 他ユーザーのアイテム = 404                       | アイテムの存在を隠蔽してリソース推測を防止。ドキュメント全体で 404 に統一                  |

## レビュー結果

（レビュー後に記載）
