# Nocturne - システム仕様書

## 1. システム概要

### 1.1 目的

クラシック音楽の鑑賞体験を記録・管理するためのWebアプリケーション。

### 1.2 主要機能

- **視聴ログ管理**: CD・配信サービス等で聴いた録音の記録
- **ユーザー登録**: メールアドレスとパスワードによるアカウント作成（メール確認付き）

### 1.3 スコープ

- **現在**: 視聴ログ機能に集中
- **将来的な拡張**: コンサート記録機能は後回し

### 1.4 想定ユーザー

クラシック音楽愛好家（個人利用を想定）

---

## 2. アーキテクチャ

### 2.1 システム構成図

```text
[ユーザー]
    ↓
[CloudFront] ← S3 (静的ホスティング)
    ↓
[Nuxt.js SPA]
    ↓ (API呼び出し + JWT トークン)
[API Gateway + Cognito Authorizer]
    ↓
[Lambda Functions]
    ↓↓
[DynamoDB] [AWS Cognito User Pool]
```

### 2.2 技術スタック

#### フロントエンド

- **フレームワーク**: Nuxt 3 (Vue 3)
- **言語**: TypeScript
- **ビルドモード**: SPA (SSR無効)
- **ホスティング**: S3 + CloudFront

#### フロントエンド Composables

| Composable         | 役割                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| `useApiBase`       | API Gateway のベース URL を返す                                                     |
| `useAuth`          | 認証処理（register・login・logout・isAuthenticated・refreshTokens・isTokenExpired） |
| `usePieces`        | 曲一覧を取得する                                                                    |
| `useRatingDisplay` | 評価値（0〜5）を星文字列に変換する (`ratingStars`)                                  |

#### フロントエンド レイアウト

| レイアウト         | 役割                                                                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` (layout) | グローバルヘッダーを含む基本レイアウト。認証状態に応じてナビゲーションリンクを切り替える（未ログイン時: 新規登録・ログインリンク表示 / ログイン済み時: ログアウトボタン表示） |

#### フロントエンド コンポーネント

| コンポーネント        | 役割                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `ListeningLogForm`    | 視聴ログの新規作成・編集で共通利用するフォーム。楽曲マスタから曲を選択した際に `videoUrl` があれば `VideoPlayer` をインライン表示する |
| `PieceForm`           | 楽曲マスタの新規作成・編集で共通利用するフォーム（`title`, `composer`, `videoUrl`）                                                   |
| `VideoPlayer`         | 動画 URL を受け取り YouTube 埋め込み / 外部リンクを切り替えて表示する。再生開始時に `play` を emit                                    |
| `QuickLogForm`        | 作曲家・曲名を自動入力し、評価・お気に入り・メモを入力して `submit` を emit するフォーム                                              |
| `PieceDetailTemplate` | 楽曲詳細ページのレイアウト。`VideoPlayer` の `play` イベント後に `QuickLogForm` を表示する                                            |
| `CategoryBadge`       | カテゴリのラベルと値を `label: value` 形式のバッジとして表示する Atom コンポーネント                                                  |
| `PieceCategoryList`   | 楽曲の4軸カテゴリ（ジャンル・時代・編成・地域）のうち設定済みのものを `CategoryBadge` で並列表示する Molecule コンポーネント          |
| `PieceItem`           | 楽曲一覧の各行コンポーネント。曲名・作曲家に加えて `PieceCategoryList` でカテゴリバッジを表示する                                     |

#### フロントエンド ユーティリティ

| ユーティリティ | 役割                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `video.ts`     | YouTube URL の判定（`isYouTubeUrl`）、動画 ID 抽出（`extractYouTubeVideoId`）、埋め込み URL 変換（`toYouTubeEmbedUrl`） |

#### バックエンド

- **ランタイム**: Node.js 24.x
- **API**: REST API (API Gateway + Lambda)
- **言語**: TypeScript
- **データベース**: DynamoDB
- **認証**: AWS Cognito User Pool (メールアドレスベースのサインアップ/サインイン)

#### インフラ

- **IaC**: AWS CDK (TypeScript)
- **CI/CD**: GitHub Actions
- **クラウド**: AWS

---

## 3. データモデル

### 3.1 視聴ログ (ListeningLog)

#### DynamoDBテーブル

- **テーブル名**: `classical-music-listening-logs`
- **パーティションキー**: `id` (String)
- **課金モード**: オンデマンド
- **GSI1**: パーティションキー `userId` (String) + ソートキー `createdAt` (String) — ユーザー別一覧取得に使用

#### データ構造

```typescript
type Rating = 1 | 2 | 3 | 4 | 5;

interface ListeningLog {
  id: string; // UUID (自動生成)
  userId: string | null; // Cognito sub（未帰属データは null）
  listenedAt: string; // 視聴日時 (ISO 8601形式)
  composer: string; // 作曲家名
  piece: string; // 曲名
  rating: Rating; // 評価 (1〜5の整数)
  isFavorite: boolean; // お気に入りフラグ
  memo?: string; // 感想・メモ (任意)
  createdAt: string; // 作成日時 (ISO 8601形式)
  updatedAt: string; // 更新日時 (ISO 8601形式)
}
```

#### バリデーション

- `rating`: 1〜5の範囲
- `listenedAt`: ISO 8601形式の日時文字列（UTC、Zサフィックス必須。例: `2024-01-15T19:30:00.000Z`）。フロントエンドは `datetime-local` 入力値をローカル時刻として `toISOString()` で変換して送信する
- `composer`: 空文字・空白のみ不可、最大100文字
- `piece`: 空文字・空白のみ不可、最大200文字
- `memo`: 最大1000文字

> バリデーションは `utils/schemas.ts` に定義した Zod スキーマで実施し、`parseRequestBody` のパース処理と統合されている。

---

### 3.2 楽曲マスタ (Piece)

#### DynamoDBテーブル

- **テーブル名**: `classical-music-pieces`
- **パーティションキー**: `id` (String)
- **課金モード**: オンデマンド

#### データ構造

```typescript
type PieceGenre =
  | "交響曲"
  | "協奏曲"
  | "室内楽"
  | "独奏曲"
  | "歌曲"
  | "オペラ"
  | "宗教音楽"
  | "その他";
type PieceEra = "バロック" | "古典派" | "ロマン派" | "近現代" | "その他";
type PieceFormation = "ピアノ独奏" | "弦楽四重奏" | "管弦楽" | "声楽" | "その他";
type PieceRegion = "ドイツ・オーストリア" | "フランス" | "ロシア" | "イタリア" | "その他";

interface Piece {
  id: string; // UUID (自動生成)
  title: string; // 曲名
  composer: string; // 作曲家名
  videoUrl?: string; // 動画 URL（任意）
  genre?: PieceGenre; // ジャンル（任意）
  era?: PieceEra; // 時代（任意）
  formation?: PieceFormation; // 編成（任意）
  region?: PieceRegion; // 地域（任意）
  createdAt: string; // 作成日時 (ISO 8601形式)
  updatedAt: string; // 更新日時 (ISO 8601形式)
}
```

#### バリデーション

- `title`: 空文字・空白のみ不可、最大200文字
- `composer`: 空文字・空白のみ不可、最大100文字
- `videoUrl`: 任意項目。指定する場合は有効な URL 形式であること（ドメイン制限なし）。更新時に空文字を送信するとフィールドが削除される
- `genre`: 任意項目。指定する場合は固定の選択肢から選択。更新時に空文字を送信するとフィールドが削除される
- `era`: 任意項目。指定する場合は固定の選択肢から選択。更新時に空文字を送信するとフィールドが削除される
- `formation`: 任意項目。指定する場合は固定の選択肢から選択。更新時に空文字を送信するとフィールドが削除される
- `region`: 任意項目。指定する場合は固定の選択肢から選択。更新時に空文字を送信するとフィールドが削除される

> バリデーションは `utils/schemas.ts` に定義した Zod スキーマで実施する。

---

## 4. API仕様

### 4.1 エンドポイント構成

- **ベースURL**: `https://{api-gateway-url}/prod`
- **認証**: AWS Cognito User Pool (Bearer Token)
  - 認証が必要なエンドポイント: `/listening-logs/*`（読み取り・書き込み）
  - 公開エンドポイント: `/auth/*`、`/pieces/*`
- **CORS**: CloudFront URL のみ許可（プリフライト・GatewayResponse の両方で設定）

### 4.2 認証API

#### `POST /auth/login`

登録済みユーザーを認証し、アクセストークンを返す

**リクエスト**

```json
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass1"
}
```

**レスポンス**

- 成功: `200 OK` `{ "accessToken": "...", "idToken": "...", "refreshToken": "...", "tokenType": "Bearer", "expiresIn": 3600 }`
- 認証失敗: `401 Unauthorized` `{ "error": "InvalidCredentials", "message": "..." }`
- メール未確認: `403 Forbidden` `{ "error": "UserNotConfirmed", "message": "..." }`
- リクエスト過多: `429 Too Many Requests`

**フロー（メール未確認時）**

1. バックエンドが `403 / UserNotConfirmed` を返す
2. フロントエンドが入力パスワードを `sessionStorage.pendingPassword` に保存
3. フロントエンドが `/auth/verify-email` へリダイレクト（`history.state.email` にメールアドレスを渡す）
4. ユーザーが確認コードを入力して確認完了、自動ログイン後トップへ遷移

#### `POST /auth/register`

新規ユーザーを登録する

**リクエスト**

```json
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass1"
}
```

**レスポンス**

- 成功: `200 OK`（空レスポンス）— Cognito がメール確認メールを送信する
- バリデーションエラー: `400 Bad Request`
- 既存ユーザー: `409 Conflict`

**パスワードルール**（Cognito User Pool 設定）

- 8文字以上
- 大文字・小文字・数字をそれぞれ1文字以上含む

**フロー**

1. フロントエンドがメールアドレス・パスワードを送信
2. Lambda が Cognito `signUp` を呼び出す
3. Cognito が確認コードをメール送信
4. フロントエンドが `/auth/verify-email` ページへ自動遷移
5. ユーザーが確認コードを入力して確認完了、自動ログイン後トップへ遷移

#### `POST /auth/verify-email`

メールで受け取った確認コードを検証し、アカウントを有効化する

**リクエスト**

```json
POST /auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**レスポンス**

- 成功: `200 OK` `{ "message": "Email confirmed successfully." }`
- コード不一致: `400 Bad Request` `{ "error": "CodeMismatch", "message": "..." }`
- 期限切れ: `400 Bad Request` `{ "error": "ExpiredCode", "message": "..." }`
- 確認済み等: `400 Bad Request` `{ "error": "NotAuthorized", "message": "..." }`
- リクエスト過多: `429 Too Many Requests`

#### `POST /auth/resend-verification-code`

確認コードを再送信する

**リクエスト**

```json
POST /auth/resend-verification-code
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**レスポンス**

- 成功: `200 OK` `{ "message": "Verification code resent. Please check your email." }`
- 既に確認済み: `400 Bad Request` `{ "error": "UserAlreadyConfirmed", "message": "..." }`
- ユーザー不存在: `400 Bad Request` `{ "error": "UserNotFound", "message": "..." }`
- リクエスト過多: `429 Too Many Requests`

#### `POST /auth/refresh`

リフレッシュトークンを使用してアクセストークン・IDトークンを更新する

**リクエスト**

```json
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJjdHkiOiJKV1Qi..."
}
```

**レスポンス**

- 成功: `200 OK` `{ "accessToken": "...", "idToken": "...", "tokenType": "Bearer", "expiresIn": 3600 }`
- リフレッシュトークン無効/期限切れ: `401 Unauthorized` `{ "error": "InvalidRefreshToken", "message": "..." }`
- リクエスト過多: `429 Too Many Requests`

**フロー**

1. フロントエンドがトークン有効期限切れを検知
2. localStorage に保存されたリフレッシュトークンで `/auth/refresh` を呼び出し
3. 成功時: 新しいアクセストークン・IDトークンで localStorage を更新
4. 失敗時: すべてのトークンを削除してログイン画面にリダイレクト

### 4.3 視聴ログAPI

> **認証必須**: すべての視聴ログエンドポイントは `Authorization: Bearer {accessToken}` ヘッダーが必要。
> API Gateway Cognito Authorizer がトークンを検証し、無効な場合は `401 Unauthorized` を返す。

#### `GET /listening-logs`

ログイン中ユーザーの視聴ログ一覧を取得

**リクエスト**

```http
GET /listening-logs
Authorization: Bearer {accessToken}
```

**レスポンス**

```json
[
  {
    "id": "uuid",
    "userId": "cognito-sub",
    "listenedAt": "2024-01-15T19:30:00Z",
    "composer": "ベートーヴェン",
    "piece": "交響曲第9番",
    "rating": 5,
    "isFavorite": true,
    "memo": "圧倒的な迫力",
    "createdAt": "2024-01-15T20:00:00Z",
    "updatedAt": "2024-01-15T20:00:00Z"
  }
]
```

**ソート順**: `listenedAt` 降順（新しい順）

**アクセス制御**: DynamoDB GSI1（userId + createdAt）を使ったクエリにより、ログイン中ユーザーのログのみ返却

#### `GET /listening-logs/{id}`

特定の視聴ログを取得

**リクエスト**

```http
GET /listening-logs/{id}
Authorization: Bearer {accessToken}
```

**レスポンス**

- 成功: `200` + ListeningLogオブジェクト
- 未存在または他ユーザーのアイテム: `404 Not Found`（存在を隠蔽）

#### `POST /listening-logs`

新規視聴ログを作成

**リクエスト**

```json
POST /listening-logs
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "listenedAt": "2024-01-15T19:30:00Z",
  "composer": "ベートーヴェン",
  "piece": "交響曲第9番",
  "rating": 5,
  "isFavorite": true,
  "memo": "圧倒的な迫力"
}
```

**レスポンス**

- 成功: `201 Created` + 作成されたListeningLogオブジェクト
- バリデーションエラー: `400 Bad Request`

**自動生成項目**

- `id`: UUID v4
- `userId`: トークンから取得した Cognito sub
- `createdAt`: 現在時刻
- `updatedAt`: 現在時刻

#### `PUT /listening-logs/{id}`

既存の視聴ログを更新

**リクエスト**

```json
PUT /listening-logs/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "rating": 4,
  "memo": "聴き直したら少し重く感じた"
}
```

**レスポンス**

- 成功: `200 OK` + 更新されたListeningLogオブジェクト
- 未存在または他ユーザーのアイテム: `404 Not Found`（存在を隠蔽）

**更新動作**

- 部分更新（Partial Update）をサポート
- `updatedAt`は自動更新
- `id`, `createdAt`, `userId`は更新不可

#### `DELETE /listening-logs/{id}`

視聴ログを削除

**リクエスト**

```http
DELETE /listening-logs/{id}
Authorization: Bearer {accessToken}
```

**レスポンス**

- 成功: `204 No Content`
- 未存在または他ユーザーのアイテム: `404 Not Found`（存在を隠蔽）

### 4.4 エラーレスポンス一覧

全エラーレスポンスは以下の形式で返される：

```json
{
  "message": "エラーメッセージ"
}
```

| ステータスコード            | 意味               | 発生条件                                       |
| --------------------------- | ------------------ | ---------------------------------------------- |
| `400 Bad Request`           | リクエスト不正     | リクエストボディが空、またはパスパラメータ不正 |
| `404 Not Found`             | リソース未存在     | 指定IDの視聴ログが存在しない                   |
| `500 Internal Server Error` | サーバー内部エラー | DynamoDB接続エラーなど予期しないエラー         |

### 4.5 データバリデーションルール

#### 視聴ログ（ListeningLog）

| フィールド   | 型                    | 必須 | バリデーション                             |
| ------------ | --------------------- | ---- | ------------------------------------------ |
| `listenedAt` | string                | ✅   | ISO 8601形式（例: `2024-01-15T19:30:00Z`） |
| `composer`   | string                | ✅   | 空文字・空白のみ不可、最大100文字          |
| `piece`      | string                | ✅   | 空文字・空白のみ不可、最大200文字          |
| `rating`     | 1 \| 2 \| 3 \| 4 \| 5 | ✅   | 1〜5の整数                                 |
| `isFavorite` | boolean               | ✅   | `true` または `false`                      |
| `memo`       | string                | -    | 最大1000文字                               |

#### 自動生成フィールド（入力不可）

| フィールド  | 内容                           |
| ----------- | ------------------------------ |
| `id`        | UUID v4（自動生成）            |
| `createdAt` | 作成時刻（ISO 8601、自動設定） |
| `updatedAt` | 更新時刻（ISO 8601、自動更新） |

---

## 5. インフラ構成

### 5.1 AWSリソース

#### DynamoDB

- **ListeningLogs**: `classical-music-listening-logs`
- **削除ポリシー**: RETAIN（データ保持）

#### Lambda

- **ランタイム**: Node.js 24.x
- **関数数**: 6個（視聴ログ用CRUD操作 × 5 + ユーザー登録 × 1）
- **環境変数**:
  - `DYNAMO_TABLE_LISTENING_LOGS`
  - `COGNITO_USER_POOL_ID`（認証系 Lambda で使用）
  - `COGNITO_CLIENT_ID`（認証系 Lambda で使用）

#### Cognito

- **User Pool**: メールアドレスベースのサインアップ/サインイン
- **自己登録**: 有効（`selfSignUpEnabled: true`）
- **メール確認**: 必須（確認コードをメール送信）
- **パスワードポリシー**: 8文字以上、大文字・小文字・数字を必須
- **App Client**: SRP 認証フロー（シークレットなし）
- **CDK Output**: `CognitoUserPoolId`, `CognitoClientId`, `CognitoUserPoolArn`

#### API Gateway

- **名前**: `classical-music-lake`
- **ステージ**: `prod`
- **CORS**: CloudFront URL のみ許可（プリフライト・GatewayResponse の両方で設定）

#### S3

- **用途**: SPAの静的ファイルホスティング
- **パブリックアクセス**: ブロック（CloudFront経由のみ）
- **削除ポリシー**: DESTROY（自動削除）

#### CloudFront

- **用途**: SPAの配信
- **エラーハンドリング**: 404/403 → index.html（SPA対応）
- **プロトコル**: HTTPS強制

### 5.2 環境変数

#### フロントエンド

- `NUXT_PUBLIC_API_BASE_URL`: API GatewayのURL

#### バックエンド（Lambda）

- `DYNAMO_TABLE_LISTENING_LOGS`: 視聴ログテーブル名（CDK が自動設定）
- `CORS_ALLOW_ORIGIN`: 許可する CORS オリジン（CDK が CloudFront URL を自動設定。未設定時は `"*"` にフォールバックするが、本番・stg は CDK が必ず設定するため未設定にはならない）

#### CI/CD（GitHub Secrets）

| シークレット名       | 用途                                          |
| -------------------- | --------------------------------------------- |
| `AWS_ROLE_TO_ASSUME` | GitHub OIDC で AssumeRole する IAM ロール ARN |

> **シークレット管理方針**: CI/CD 認証は GitHub Actions OIDC + IAM Role Assume によるキーレス認証を採用。長期 AWS アクセスキーを使用しない。Lambda 環境変数に秘密情報は含まれない（テーブル名・CORS オリジンのみ）。将来フェーズで認証機能を追加する場合は AWS Secrets Manager の導入を検討すること。
>
> **IAM 信頼ポリシー要件**: IAM ロールの信頼ポリシーには以下を必ず設定すること。誤設定を防ぐため、Action・Condition キー・値を明記する。
>
> - **Action**: `sts:AssumeRoleWithWebIdentity`
> - **Condition**:
>   - `token.actions.githubusercontent.com:aud` = `sts.amazonaws.com`
>   - `token.actions.githubusercontent.com:sub` = `repo:<org>/<repo>:ref:refs/heads/<branch>`（例: `repo:konabe/classical-music-lake:ref:refs/heads/main`）

---

## 6. デプロイメント

### 6.1 環境構成

| 環境   | スタック名                    | DynamoDB テーブル名                  | 削除ポリシー | 用途                                     |
| ------ | ----------------------------- | ------------------------------------ | ------------ | ---------------------------------------- |
| `prod` | `ClassicalMusicLakeStack`     | `classical-music-listening-logs`     | RETAIN       | 本番環境                                 |
| `stg`  | `ClassicalMusicLakeStack-stg` | `classical-music-listening-logs-stg` | DESTROY      | リリース前の検証環境                     |
| `dev`  | `ClassicalMusicLakeStack-dev` | `classical-music-listening-logs-dev` | DESTROY      | 開発環境（ローカル環境からの接続も想定） |

### 6.2 デプロイフロー

```text
GitHub (main branch)         → prod 自動デプロイ
GitHub (stg* タグ push)      → stg 自動デプロイ
GitHub (dev* タグ push)      → dev 自動デプロイ
GitHub (workflow_dispatch)   → dev / stg / prod を手動選択
  → GitHub Actions
    → Nuxt ビルド (npm run generate)
    → CDK デプロイ (STAGE_NAME 環境変数で対象環境を指定)
      → Lambda + API Gateway + DynamoDB 作成/更新
      → S3 + CloudFront 作成/更新
      → SPAファイル デプロイ
```

### 6.3 GitHub Actions

#### deploy.yml（デプロイ）

- **トリガー**:
  - `push to main` → prod 環境へ自動デプロイ
  - `push stg* tag` → stg 環境へ自動デプロイ
  - `push dev* tag` → dev 環境へ自動デプロイ
  - `workflow_dispatch` → dev / stg / prod を選択してデプロイ
- **Secrets**:
  - `AWS_ROLE_TO_ASSUME`

#### sync-db.yml（DB 同期）

- **概要**: prod の DynamoDB データを stg へ全件コピーする
- **対象テーブル**:
  - `classical-music-pieces` → `classical-music-pieces-stg`
  - ※ 視聴ログ（`classical-music-listening-logs`）は個人情報を含むため同期対象外
- **トリガー**:
  - スケジュール: 毎日 0:00 JST（UTC 15:00）に自動実行
  - `workflow_dispatch`: 手動実行も可能
- **動作**:
  1. stg テーブルの既存データを全件削除
  2. prod テーブルの全データを stg へ書き込み（BatchWriteItem、25 件単位）
  3. UnprocessedItems は指数バックオフで最大 5 回リトライ
- **Secrets**:
  - `AWS_ROLE_TO_ASSUME`（prod テーブルへの `dynamodb:Scan`、stg テーブルへの `dynamodb:Scan` / `dynamodb:BatchWriteItem` 権限が必要）

### 6.4 ロールバック戦略

#### バックエンド (Lambda / API Gateway)

CloudFormation はデプロイ失敗時に自動ロールバックする。
手動でロールバックが必要な場合:

```bash
# 問題のあるコミットを revert してプッシュ（再デプロイが自動実行される）
git revert <commit-hash>
git push origin main
```

または CloudFormation コンソール / CLI で直前のスタックバージョンに戻す:

```bash
aws cloudformation cancel-update-stack --stack-name ClassicalMusicLakeStack
```

#### フロントエンド (S3 静的ファイル)

prod の S3 バケットはバージョニング有効のため、以前のファイルバージョンに戻せる:

```bash
# バケット名を取得
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name ClassicalMusicLakeStack \
  --query 'Stacks[0].Outputs[?OutputKey==`SpaBucket`].OutputValue' \
  --output text)

# 前バージョンの index.html を確認
aws s3api list-object-versions --bucket $BUCKET --prefix index.html

# git revert + push で再デプロイするのが最も確実な方法
git revert <commit-hash>
git push origin main
```

---

## 7. 開発環境

### 7.1 必須ツール

- Node.js 24.x以上
- npm または yarn
- AWS CLI
- AWS CDK CLI

### 7.2 ローカル開発

#### フロントエンド起動

```bash
# 依存パッケージインストール
npm install

# 環境変数設定
export NUXT_PUBLIC_API_BASE_URL=https://your-api-url/prod

# 開発サーバー起動
npm run dev
```

#### バックエンド開発

```bash
cd backend
npm install
# Lambda関数は AWS SAM や Serverless Framework でローカルテスト可能
```

#### インフラデプロイ

```bash
cd cdk
npm install
cdk bootstrap  # 初回のみ
cdk deploy
```

---

## 8. 型定義管理方針

### 8.1 フロント・バックエンド共通型の管理

フロントエンド（`app/types/index.ts`）とバックエンド（`backend/src/types/index.ts`）はパッケージが分離されているため、共有型は両ファイルに重複定義する。

#### 共有型（両ファイルで同一定義を維持すること）

| 型名・定数名              | 説明                                           |
| ------------------------- | ---------------------------------------------- |
| `Rating`                  | 評価値（1〜5 の整数）                          |
| `ApiErrorResponse`        | APIエラーレスポンスのボディ                    |
| `ListeningLog`            | 鑑賞ログ                                       |
| `CreateListeningLogInput` | 鑑賞ログ作成入力                               |
| `UpdateListeningLogInput` | 鑑賞ログ更新入力                               |
| `Piece`                   | 楽曲マスタ                                     |
| `CreatePieceInput`        | 楽曲マスタ作成入力                             |
| `UpdatePieceInput`        | 楽曲マスタ更新入力                             |
| `PIECE_GENRES`            | ジャンルの値定数配列（型 `PieceGenre` を導出） |
| `PIECE_ERAS`              | 時代の値定数配列（型 `PieceEra` を導出）       |
| `PIECE_FORMATIONS`        | 編成の値定数配列（型 `PieceFormation` を導出） |
| `PIECE_REGIONS`           | 地域の値定数配列（型 `PieceRegion` を導出）    |

#### バックエンド固有（`backend/src/types/index.ts` にのみ存在）

| 関数名・型名    | 説明                                                     |
| --------------- | -------------------------------------------------------- |
| `isValidRating` | Rating のバリデーション関数（Lambda 内バリデーション用） |

#### 変更時のチェックリスト

1. 共有型を変更する場合、`app/types/index.ts` と `backend/src/types/index.ts` の両方を更新する
2. バックエンド固有の型・関数はバックエンド側にのみ追加し、フロントエンド側には移植しない
3. フロントエンド固有の型はフロントエンド側にのみ追加し、バックエンド側には移植しない

---

## 9. 制限事項・今後の課題

### 9.1 現在の制限

- **認証**: メールアドレス・パスワード認証のみ（SNS・OAuth は未実装）
- **MFA なし**: 多要素認証は将来フェーズで実装予定
- **検索機能なし**: DynamoDB Scanのみ
- **ページネーションなし（フロント向け）**: API はページネーション済みで全件取得するが、フロントエンドへのページング機能は未実装
- **画像アップロードなし**: テキストベースのみ

### 9.2 将来的な拡張案

- ソーシャルログイン（Google/Apple Sign-In等）
- 多要素認証（MFA）
- 全文検索（OpenSearch等）
- ページネーション
- アルバムカバー画像の管理
- タグ・カテゴリ機能
- データのエクスポート機能
- 統計・分析ダッシュボード

---

## 10. 変更履歴

| 日付       | バージョン | 変更内容                                                                                                                                                                                                  |
| ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-02 | 1.7.1      | カテゴリの値を定数配列（`PIECE_GENRES` 等）として一箇所に集約し、型・Zodスキーマ・フォーム選択肢を導出するよう統一                                                                                        |
| 2026-03-31 | 1.7.0      | トークンリフレッシュ機能追加（`POST /auth/refresh` エンドポイント新設、ログイン時に `refreshToken`・有効期限を保存、auth ミドルウェアで期限切れ時に自動リフレッシュ、401 時にリフレッシュ試行後リトライ） |
| 2026-03-28 | 1.6.1      | コード品質改善: truthy/falsy 依存を全廃し明示的な null/undefined 比較に統一。`@typescript-eslint/strict-boolean-expressions` および `vitest/no-restricted-matchers` ESLint ルールを追加し再発を防止       |
| 2026-03-26 | 1.6.0      | `ListeningLogForm` に楽曲選択時の動画プレビュー機能を追加（`videoUrl` ありの曲を選択すると `VideoPlayer` をインライン表示）                                                                               |
| 2026-03-25 | 1.5.0      | 楽曲詳細ページ（`/pieces/[id]`）追加、`VideoPlayer`・`QuickLogForm`・`PieceDetailTemplate` 新設、動画再生起点のクイックログ記録フローを実装                                                               |
| 2026-03-23 | 1.3.3      | `useFetch` の `onResponseError` で 401 時に `handleAuthError` を呼び出し、ログイン画面へリダイレクトするよう修正（`useListeningLogs.list`、`useListeningLog`）                                            |
| 2026-03-22 | 1.3.2      | ヘッダーナビゲーション改善（未ログイン時: 新規登録・ログインリンク表示、ログイン済み時: ログアウトボタン表示・認証リンク非表示）                                                                          |
| 2026-03-21 | 1.3.1      | ログアウト機能追加（useAuth: logout/isAuthenticated、auth ミドルウェア、ナビバーボタン）                                                                                                                  |
| 2026-03-25 | 1.4.0      | `Piece` に `videoUrl` フィールドを追加（任意・URL形式バリデーション）、楽曲フォームに動画 URL 入力欄を追加                                                                                                |
| 2026-03-21 | 1.3.0      | AWS Cognito ユーザー登録機能を追加（`POST /auth/register`、`useAuth` composable）                                                                                                                         |
| 2026-03-17 | 1.2.5      | CDK CORS 設定を DRY 化（`addCors` ヘルパー）、型定義ファイルの管理方針コメントを整備                                                                                                                      |
| 2026-03-17 | 1.2.4      | Create入力の実体バリデーション強化（空白のみ禁止・最大文字数制限）                                                                                                                                        |
| 2026-03-16 | 1.2.3      | Zod を導入しリクエストボディのパース処理にバリデーションを統合                                                                                                                                            |
| 2026-03-15 | 1.2.2      | `listening-logs/list.ts` を DynamoDB ページネーション対応に統一                                                                                                                                           |
| 2026-03-15 | 1.2.1      | バックエンドの JSON パース処理を `utils/parsing.ts` に共通化                                                                                                                                              |
| 2026-03-11 | 1.2.0      | TOPページに管理者向けリンクセクション（楽曲マスタ導線）を追加                                                                                                                                             |
| 2026-03-07 | 1.1.0      | performer・conductor フィールド削除、DELETE レスポンス 204 に修正                                                                                                                                         |
| 2026-03-02 | 1.0.1      | Node.js 24.x対応                                                                                                                                                                                          |
| 2026-03-02 | 1.0.0      | 初版作成                                                                                                                                                                                                  |
