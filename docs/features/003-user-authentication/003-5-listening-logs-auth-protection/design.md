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
    - ユーザー ID（sub）抽出 → authorizer.claims.sub
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
  （sub は authorizer.claims オブジェクト内に格納される Cognito User Pool の動作に合わせた参照パス）

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
パーティションキー: id（UUID）← 既存と同じ、変更なし
ソートキー: （なし）
グローバルセカンダリインデックス (GSI1: ユーザー別クエリ用):
  - パーティションキー: userId（Cognito sub）
  - ソートキー: createdAt（ISO 8601）
属性: id (UUID), userId, piece, performance, rating, memo, createdAt, updatedAt
```

**背景**: PK を id（UUID）のまま維持することで `/listening-logs/{id}` の Get/Update/Delete を `GetItem` で効率的に解決できる。ユーザー別一覧は GSI1（userId + createdAt）を使用して Query する。

### Lambda 関数の変更

#### 各操作での処理パターン

**Create (POST /listening-logs)**:

```text
1. Authorization ヘッダーから JWT 抽出
2. API Gateway Authorizer が検証、claims.sub をコンテキストに埋め込み
3. Lambda が event.requestContext.authorizer.claims.sub から userId を取得
4. リクエストボディの piece, performance 等から新しいドキュメントを作成
5. id（UUID）, userId, createdAt をドキュメントに追加
6. DynamoDB に保存（PK: id）
7. 201 Created + ドキュメント返却
```

**List (GET /listening-logs)**:

```text
1. event.requestContext.authorizer.claims.sub から userId を取得
2. GSI1 を使用して Query: userId でフィルタリング（ソートキー: createdAt）
3. 自分のログのみ返却
```

**Get (GET /listening-logs/{id})**:

```text
1. event.requestContext.authorizer.claims.sub から userId を取得
2. GetItem: PK=id で DynamoDB から取得
3. アイテムが存在しない場合は 404 Not Found
4. アイテムの userId が自分と一致しない場合は 403 Forbidden
5. 一致する場合はアイテムを返却
```

**Update (PUT /listening-logs/{id})**:

```text
1. event.requestContext.authorizer.claims.sub から userId を取得
2. GetItem: PK=id で DynamoDB から取得
3. アイテムが存在しない場合は 404 Not Found
4. アイテムの userId が自分と一致しない場合は 403 Forbidden
5. 更新・保存
```

**Delete (DELETE /listening-logs/{id})**:

```text
1. event.requestContext.authorizer.claims.sub から userId を取得
2. GetItem: PK=id で DynamoDB から取得
3. アイテムが存在しない場合は 404 Not Found
4. アイテムの userId が自分と一致しない場合は 403 Forbidden
5. 削除
```

### エラーハンドリング

| シナリオ                       | HTTP ステータス  | レスポンス                                                                    |
| ------------------------------ | ---------------- | ----------------------------------------------------------------------------- |
| Authorization ヘッダーなし     | 401 Unauthorized | API Gateway が自動返却                                                        |
| JWT 無効                       | 401 Unauthorized | API Gateway が自動返却                                                        |
| JWT 期限切れ                   | 401 Unauthorized | API Gateway が自動返却                                                        |
| 他ユーザーのアイテムにアクセス | 403 Forbidden    | `{ error: "Forbidden", message: "You do not have access to this resource." }` |
| アイテムが存在しない           | 404 Not Found    | `{ error: "NotFound", message: "..." }`                                       |

## フロントエンド設計

### API 呼び出し

**Composable**: `composables/useApiBase.ts`（既存）を拡張

```text
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
  2. CDK のカスタムリソース（Lambda）でマイグレーション実行
  3. 各レコードの userId を `null` に設定し「未帰属（unassigned）」としてマーク（デフォルトユーザー ID は割り当てない）
  4. 認可ロジックは `userId=null` のレコードを通常ユーザーへの返却対象から除外する（アクセス不可）
  5. 将来の管理者専用移管フロー（管理者が所有者を手動アサインし監査ログを記録）で移行先ユーザーに帰属させる
  6. 検証後、未帰属レコードの取り扱いポリシーを確定

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
| **404 vs 403**                 | 他ユーザーのアイテム = 403、アイテム不存在 = 404 | 403 でアクセス拒否を明示。アイテム不存在は 404 で区別し、一貫性を保つ。 |

## レビュー結果

（レビュー後に記載）
