# Nocturne - システム仕様書

## 1. システム概要

### 1.1 目的

クラシック音楽の鑑賞体験を記録・管理するためのWebアプリケーション。

### 1.2 主要機能

- **視聴ログ管理**: CD・配信サービス等で聴いた録音の記録
- **コンサート記録管理**: 実際に聴いたコンサートの記録（会場・指揮者・オーケストラ・ソリスト）
- **楽曲マスタ管理**: 楽曲の登録・編集・削除（管理者のみ）
- **作曲家マスタ管理**: 作曲家の登録・編集・削除（管理者のみ）
- **ユーザー登録**: メールアドレスとパスワードによるアカウント作成（メール確認付き）

### 1.3 スコープ

- **現在**: 視聴ログ機能・コンサート記録機能（作成・一覧・詳細・編集・削除）

### 1.4 想定ユーザー

クラシック音楽愛好家（個人利用を想定）

---

## 2. アーキテクチャ

### 2.1 システム構成図

```text
[ユーザー]
    ↓ nocturne-app.com / stg.nocturne-app.com / dev.nocturne-app.com
[Route53] → [CloudFront + ACM証明書] ← S3 (静的ホスティング)
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

| Composable              | 役割                                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `useApiBase`            | API Gateway のベース URL を返す                                                                                                               |
| `useCognitoConfig`      | Cognito Hosted UI のドメインとクライアント ID を返す                                                                                          |
| `useAuth`               | 認証処理（register・login・logout・isAuthenticated・refreshTokens・isTokenExpired・loginWithGoogle・handleOAuthCallback）                     |
| `usePieces`             | 曲一覧を取得する                                                                                                                              |
| `useRatingDisplay`      | 評価値（0〜5）を星文字列に変換する (`ratingStars`)                                                                                            |
| `useConcertLogs`        | コンサート記録の一覧取得（`list`）・作成（`create`）・更新（`update`）・削除（`deleteLog`）を行う。401 時にトークンリフレッシュを自動試行する |
| `useConcertLog`         | 特定のコンサート記録を id で取得する（詳細ページ用）                                                                                          |
| `useComposersPaginated` | 作曲家マスタ一覧のカーソル型ページング / 無限スクロール取得・作成（`createComposer`）・更新（`updateComposer`）                               |
| `useComposer`           | 特定の作曲家を id で取得する（詳細ページ用）                                                                                                  |
| `useSubmitHandler`      | フォーム送信時の `try/catch` とエラーメッセージ設定・成功後の `navigateTo` 遷移を共通化する。new/edit 系ページで使用                          |

#### フロントエンド レイアウト

| レイアウト         | 役割                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` (layout) | グローバルヘッダーを含む基本レイアウト。ナビゲーションリンクは「鑑賞記録」「楽曲マスタ」「作曲家マスタ」「コンサート記録」。認証状態に応じて右側リンクを切り替える（未ログイン時: 新規登録・ログインリンク表示 / ログイン済み時: ログアウトボタン表示）。ヘッダー右端に `ThemeToggle`（ライト/ダーク切替ボタン）を配置 |
| `auth` (layout)    | 認証ページ（`/auth/login`・`/auth/user-register`・`/auth/verify-email`）用レイアウト。ホームへ戻れるロゴ付きの最小ヘッダーとフォーム用の中央寄せメイン領域を提供。ヘッダー右端に `ThemeToggle` を配置                                                                                                                  |

#### フロントエンド ユーティリティ

| ユーティリティ | 役割                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `video.ts`     | YouTube URL の判定（`isYouTubeUrl`）、動画 ID 抽出（`extractYouTubeVideoId`）、埋め込み URL 変換（`toYouTubeEmbedUrl`） |

#### テーマ（ライト/ダークモード）

- **モジュール**: [`@nuxtjs/color-mode`](https://color-mode.nuxtjs.org/) を採用。`<html>` ルート要素に `light` / `dark` クラスを付与する
- **設定**（`nuxt.config.ts`）:
  - `preference: "system"` — 初回はシステム設定（OS のダーク/ライト設定）に追従
  - `fallback: "light"` — システム検出に失敗した場合のデフォルト
  - `classSuffix: ""` — クラス名を `light` / `dark`（接尾辞なし）に統一
  - `storageKey: "nocturne-color-mode"` — ユーザー選択を localStorage に保存
- **カラーパレット定義**: `app/assets/css/theme.css` で `:root.light` / `:root.dark` ごとに CSS 変数（`--color-bg-base`、`--color-text`、`--color-primary` など意味的トークン）を定義し、各コンポーネントは `var(--xxx)` 経由で参照する
- **ダークモードのカラーキー**: ネイビー寄りパレット（背景は `#0f1729`、サーフェスは `#1a2547`、プライマリは `#4a6ba8`）
- **切替 UI**: `ThemeToggle` atom（月/太陽アイコンの円形ボタン）をヘッダー右端に配置。`default` レイアウトと `auth` レイアウトの両方で利用可能
- **永続化**: ユーザー選択は localStorage に保存され、リロード後も維持される

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

### 3.3 作曲家マスタ (Composer)

#### DynamoDBテーブル

- **テーブル名**: `classical-music-composers`
- **パーティションキー**: `id` (String)
- **課金モード**: オンデマンド

#### データ構造

```typescript
interface Composer {
  id: string; // UUID (自動生成)
  name: string; // 作曲家名
  era?: PieceEra; // 時代（任意、楽曲マスタと共通の定数を流用）
  region?: PieceRegion; // 地域（任意、楽曲マスタと共通の定数を流用）
  createdAt: string; // 作成日時 (ISO 8601形式)
  updatedAt: string; // 更新日時 (ISO 8601形式)
}
```

#### バリデーション

- `name`: 空文字・空白のみ不可、最大100文字
- `era`: 任意項目。指定する場合は固定の選択肢から選択。更新時に空文字を送信するとフィールドが削除される
- `region`: 任意項目。指定する場合は固定の選択肢から選択。更新時に空文字を送信するとフィールドが削除される

> バリデーションは `utils/schemas.ts` に定義した Zod スキーマで実施する。

---

### 3.4 コンサート記録 (ConcertLog)

#### DynamoDBテーブル

- **テーブル名**: `classical-music-concert-logs`
- **パーティションキー**: `id` (String)
- **課金モード**: オンデマンド
- **GSI1**: パーティションキー `userId` (String) + ソートキー `createdAt` (String) — ユーザー別一覧取得に使用
- **削除ポリシー**: prod は RETAIN、stg/dev は DESTROY

#### データ構造

```typescript
interface ConcertLog {
  id: string; // UUID (自動生成)
  userId: string; // Cognito sub（認証必須のため null なし）
  title: string; // コンサート名
  concertDate: string; // 開催日時 (ISO 8601形式)
  venue: string; // 会場名
  conductor?: string; // 指揮者名（任意）
  orchestra?: string; // オーケストラ・アンサンブル名（任意）
  soloist?: string; // ソリスト名（任意）
  pieceIds?: string[]; // プログラム（楽曲マスタ ID の配列、演奏順）（任意）
  createdAt: string; // 作成日時 (ISO 8601形式)
  updatedAt: string; // 更新日時 (ISO 8601形式)
}
```

#### バリデーション

- `title`: 空文字・空白のみ不可、最大200文字
- `concertDate`: ISO 8601形式の日時文字列（UTC、Zサフィックス必須）。フロントエンドは `datetime-local` 入力値をローカル時刻として `toISOString()` で変換して送信する
- `venue`: 空文字・空白のみ不可、最大200文字
- `conductor`: 任意項目。指定する場合は最大100文字
- `orchestra`: 任意項目。指定する場合は最大100文字
- `soloist`: 任意項目。指定する場合は最大100文字
- `pieceIds`: 任意項目。指定する場合は UUID 形式の文字列の配列。空配列は許容（プログラムなし / 全削除を表現）

> バリデーションは `utils/schemas.ts` の `createConcertLogSchema`（作成時）・`updateConcertLogSchema`（更新時）Zod スキーマで実施する。`updateConcertLogSchema` は `createConcertLogSchema.partial()` により全フィールドが任意となる。

---

## 4. API仕様

### 4.1 エンドポイント構成

- **ベースURL**: `https://{api-gateway-url}/prod`
- **認証**: AWS Cognito User Pool (Bearer Token)
  - 認証が必要なエンドポイント: `/listening-logs/*`、`/concert-logs/*`（読み取り・書き込み）、`/pieces` と `/composers` の書き込み系（`POST` / `PUT /{id}` / `DELETE /{id}`）。書き込み系はさらに `admin` グループ必須
  - 公開エンドポイント: `/auth/*`、`/pieces` と `/composers` の参照系（`GET` / `GET /{id}`）
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

#### `GET /auth/callback`（Cognito Hosted UI コールバック）

Cognito Hosted UI からのリダイレクトを受け取り、認可コードをトークンと交換する（フロントエンド処理）

**フロー**

1. Cognito Hosted UI が Google 認証後に `/auth/callback?code=...` へリダイレクト
2. フロントエンドが `useCognitoConfig` で取得した Cognito ドメインのトークンエンドポイントへ認可コードを送信
3. 成功時: アクセストークン・IDトークン・リフレッシュトークンを localStorage に保存してトップへ遷移
4. 失敗時: エラーメッセージを表示

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

### 4.4 コンサート記録API

> **認証必須**: すべてのコンサート記録エンドポイントは `Authorization: Bearer {accessToken}` ヘッダーが必要。
> API Gateway Cognito Authorizer がトークンを検証し、無効な場合は `401 Unauthorized` を返す。

#### `GET /concert-logs`

ログイン中ユーザーのコンサート記録一覧を取得

**リクエスト**

```http
GET /concert-logs
Authorization: Bearer {accessToken}
```

**レスポンス**

```json
[
  {
    "id": "uuid",
    "userId": "cognito-sub",
    "title": "〇〇交響楽団 定期演奏会 第123回",
    "concertDate": "2024-01-15T19:00:00.000Z",
    "venue": "サントリーホール",
    "conductor": "カラヤン",
    "orchestra": "ベルリン・フィルハーモニー管弦楽団",
    "soloist": "アルゲリッチ",
    "pieceIds": ["piece-uuid-1", "piece-uuid-2"],
    "createdAt": "2024-01-15T20:00:00.000Z",
    "updatedAt": "2024-01-15T20:00:00.000Z"
  }
]
```

**ソート順**: `concertDate` 降順（新しい順）

**アクセス制御**: DynamoDB GSI1（userId + createdAt）を使ったクエリにより、ログイン中ユーザーの記録のみ返却

#### `GET /concert-logs/{id}`

特定のコンサート記録を取得

**リクエスト**

```http
GET /concert-logs/{id}
Authorization: Bearer {accessToken}
```

**レスポンス**

- 成功: `200 OK` + ConcertLog オブジェクト（`pieceIds` フィールドを含む）
- 未存在または他ユーザーのアイテム: `404 Not Found`（存在を隠蔽）

#### `POST /concert-logs`

新規コンサート記録を作成

**リクエスト**

```json
POST /concert-logs
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "〇〇交響楽団 定期演奏会 第123回",
  "concertDate": "2024-01-15T19:00:00.000Z",
  "venue": "サントリーホール",
  "conductor": "カラヤン",
  "orchestra": "ベルリン・フィルハーモニー管弦楽団",
  "soloist": "アルゲリッチ",
  "pieceIds": ["piece-uuid-1", "piece-uuid-2"]
}
```

**レスポンス**

- 成功: `201 Created` + 作成された ConcertLog オブジェクト
- バリデーションエラー: `400 Bad Request`

**自動生成項目**

- `id`: UUID v4
- `userId`: トークンから取得した Cognito sub
- `createdAt`: 現在時刻
- `updatedAt`: 現在時刻

#### `PUT /concert-logs/{id}`

既存のコンサート記録を更新

**リクエスト**

```json
PUT /concert-logs/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "東京フィル特別演奏会",
  "venue": "東京文化会館",
  "conductor": "小澤征爾",
  "pieceIds": ["piece-uuid-1", "piece-uuid-3"]
}
```

**レスポンス**

- 成功: `200 OK` + 更新された ConcertLog オブジェクト
- 未存在または他ユーザーのアイテム: `404 Not Found`（存在を隠蔽）
- バリデーションエラー: `400 Bad Request`

**更新動作**

- 部分更新（Partial Update）をサポート
- `updatedAt` は自動更新
- `id`, `createdAt`, `userId` は更新不可

#### `DELETE /concert-logs/{id}`

コンサート記録を削除

**リクエスト**

```http
DELETE /concert-logs/{id}
Authorization: Bearer {accessToken}
```

**レスポンス**

- 成功: `204 No Content`
- 未存在または他ユーザーのアイテム: `404 Not Found`（存在を隠蔽）

### 4.5 楽曲マスタAPI

> **認可ルール**: 参照系（`GET /pieces` / `GET /pieces/{id}`）は認証不要で公開。書き込み系（`POST /pieces` / `PUT /pieces/{id}` / `DELETE /pieces/{id}`）は `admin` グループに所属する認証済みユーザーのみ実行可能。

#### `GET /pieces`

楽曲マスタ一覧をカーソル型ページングで取得する。

**リクエスト**

```http
GET /pieces?limit=50&cursor={opaque}
```

| クエリパラメータ | 型     | 必須 | 既定 | 説明                                                                         |
| ---------------- | ------ | ---- | ---- | ---------------------------------------------------------------------------- |
| `limit`          | number | -    | 50   | 1 ページあたりの件数。最小 1、最大 100。範囲外は `400 Bad Request`           |
| `cursor`         | string | -    | なし | 前回レスポンスで返却された `nextCursor` を指定して続きを取得。不正値は `400` |

**レスポンス**

- 成功: `200 OK`

  ```json
  {
    "items": [
      {
        "id": "piece-uuid",
        "title": "交響曲第9番",
        "composer": "ベートーヴェン",
        "videoUrl": "https://...",
        "genre": "交響曲",
        "era": "古典派",
        "formation": "管弦楽",
        "region": "ドイツ・オーストリア",
        "createdAt": "2024-01-15T20:00:00.000Z",
        "updatedAt": "2024-01-15T20:00:00.000Z"
      }
    ],
    "nextCursor": "opaque-base64url-string"
  }
  ```

  - `items`: 最大 `limit` 件の Piece オブジェクト配列
  - `nextCursor`: 次ページ取得用の不透明カーソル。次ページが無い場合は `null`

- バリデーションエラー: `400 Bad Request`

**ソート順**: DynamoDB Scan の戻り順（順不同）。`title` 等の特定順序は保証しない。

**カーソル仕様**

- `base64url(JSON.stringify({ v: 1, k: LastEvaluatedKey }))` 形式の不透明文字列。
- クライアントは中身を解析せず、そのまま次リクエストの `cursor` に渡す。
- 形式（文字レベル）は Zod の `z.base64url()` で検証し、デコード後の JSON 不正・未知バージョンは `decodeCursor` で検出して 400 を返す。
- 改ざん検出（HMAC）は行わない。楽曲マスタは全ユーザ共通のためテナント境界を越えるリスクが無いため。

#### `GET /pieces/{id}`

従来どおり（Piece オブジェクトの単件取得）。認証不要。データ構造は 3.2 節を参照。

#### `POST /pieces` / `PUT /pieces/{id}` / `DELETE /pieces/{id}`

楽曲マスタの単件作成・更新・削除（Piece オブジェクト）。データ構造とバリデーションは 3.2 節と本節 4.7 を参照。

**認可ルール**

- `Authorization: Bearer {idToken}` ヘッダーが必須（API Gateway Cognito Authorizer で検証）
- ID Token の `cognito:groups` クレームに `admin` が含まれていること
- 認可は Cognito Authorizer（トークン検証）と Lambda ハンドラ（グループ判定）の二段構えで強制する

**エラーレスポンス**

- 認証ヘッダーなし・無効/期限切れトークン: `401 Unauthorized`（API Gateway Authorizer が返却）
- 認証済みだが `admin` 非所属: `403 Forbidden` + `{ "message": "Admin privilege required" }`

### 4.6 作曲家マスタAPI

> **認可ルール**: 参照系（`GET /composers` / `GET /composers/{id}`）は認証不要で公開。書き込み系（`POST /composers` / `PUT /composers/{id}` / `DELETE /composers/{id}`）は `admin` グループに所属する認証済みユーザーのみ実行可能。

#### `GET /composers`

作曲家マスタ一覧をカーソル型ページングで取得する。

**リクエスト**

```http
GET /composers?limit=50&cursor={opaque}
```

| クエリパラメータ | 型     | 必須 | 既定 | 説明                                                                         |
| ---------------- | ------ | ---- | ---- | ---------------------------------------------------------------------------- |
| `limit`          | number | -    | 50   | 1 ページあたりの件数。最小 1、最大 100。範囲外は `400 Bad Request`           |
| `cursor`         | string | -    | なし | 前回レスポンスで返却された `nextCursor` を指定して続きを取得。不正値は `400` |

**レスポンス**

- 成功: `200 OK`

  ```json
  {
    "items": [
      {
        "id": "composer-uuid",
        "name": "ベートーヴェン",
        "era": "古典派",
        "region": "ドイツ・オーストリア",
        "createdAt": "2024-01-15T20:00:00.000Z",
        "updatedAt": "2024-01-15T20:00:00.000Z"
      }
    ],
    "nextCursor": "opaque-base64url-string"
  }
  ```

- バリデーションエラー: `400 Bad Request`

**ソート順**: DynamoDB Scan の戻り順（順不同）。

#### `GET /composers/{id}`

特定の作曲家を取得。認証不要。データ構造は 3.3 節を参照。

**レスポンス**

- 成功: `200 OK` + Composer オブジェクト
- 未存在: `404 Not Found`

#### `POST /composers` / `PUT /composers/{id}` / `DELETE /composers/{id}`

作曲家マスタの単件作成・更新・削除。データ構造とバリデーションは 3.3 節を参照。

**認可ルール**

- `Authorization: Bearer {idToken}` ヘッダーが必須（API Gateway Cognito Authorizer で検証）
- ID Token の `cognito:groups` クレームに `admin` が含まれていること
- 認可は Cognito Authorizer（トークン検証）と Lambda ハンドラ（グループ判定）の二段構えで強制する

**エラーレスポンス**

- 認証ヘッダーなし・無効/期限切れトークン: `401 Unauthorized`（API Gateway Authorizer が返却）
- 認証済みだが `admin` 非所属: `403 Forbidden` + `{ "message": "Admin privilege required" }`
- 更新時に楽観的ロックが失敗: `409 Conflict` + `{ "message": "Composer was updated by another request" }`

### 4.7 エラーレスポンス一覧

全エラーレスポンスは以下の形式で返される：

```json
{
  "message": "エラーメッセージ"
}
```

| ステータスコード            | 意味               | 発生条件                                                                               |
| --------------------------- | ------------------ | -------------------------------------------------------------------------------------- |
| `400 Bad Request`           | リクエスト不正     | リクエストボディが空、またはパスパラメータ不正                                         |
| `401 Unauthorized`          | 未認証             | 認証必須エンドポイントで認証ヘッダー・トークンが不正（API Gateway Authorizer）         |
| `403 Forbidden`             | 権限不足           | 認証済みだが権限不足（例: 楽曲マスタ書き込み API への `admin` 非所属ユーザーアクセス） |
| `404 Not Found`             | リソース未存在     | 指定IDの視聴ログが存在しない                                                           |
| `500 Internal Server Error` | サーバー内部エラー | DynamoDB接続エラーなど予期しないエラー                                                 |

### 4.8 データバリデーションルール

#### 視聴ログ（ListeningLog）

| フィールド   | 型                    | 必須 | バリデーション                             |
| ------------ | --------------------- | ---- | ------------------------------------------ |
| `listenedAt` | string                | ✅   | ISO 8601形式（例: `2024-01-15T19:30:00Z`） |
| `composer`   | string                | ✅   | 空文字・空白のみ不可、最大100文字          |
| `piece`      | string                | ✅   | 空文字・空白のみ不可、最大200文字          |
| `rating`     | 1 \| 2 \| 3 \| 4 \| 5 | ✅   | 1〜5の整数                                 |
| `isFavorite` | boolean               | ✅   | `true` または `false`                      |
| `memo`       | string                | -    | 最大1000文字                               |

#### コンサート記録（ConcertLog）

| フィールド    | 型       | 必須 | バリデーション                             |
| ------------- | -------- | ---- | ------------------------------------------ |
| `title`       | string   | ✅   | 空文字・空白のみ不可、最大200文字          |
| `concertDate` | string   | ✅   | ISO 8601形式（例: `2024-01-15T19:00:00Z`） |
| `venue`       | string   | ✅   | 空文字・空白のみ不可、最大200文字          |
| `conductor`   | string   | -    | 最大100文字                                |
| `orchestra`   | string   | -    | 最大100文字                                |
| `soloist`     | string   | -    | 最大100文字                                |
| `pieceIds`    | string[] | -    | UUID 形式の文字列の配列。空配列は許容      |

> 更新時（`PUT /concert-logs/{id}`）はすべてのフィールドが任意となる（`updateConcertLogSchema` は `createConcertLogSchema.partial()` で導出）。

#### 作曲家マスタ（Composer）

| フィールド | 型                 | 必須 | バリデーション                    |
| ---------- | ------------------ | ---- | --------------------------------- |
| `name`     | string             | ✅   | 空文字・空白のみ不可、最大100文字 |
| `era`      | PieceEra (enum)    | -    | 指定する場合は固定の選択肢から    |
| `region`   | PieceRegion (enum) | -    | 指定する場合は固定の選択肢から    |

> 更新時（`PUT /composers/{id}`）はすべてのフィールドが任意となる（`updateComposerSchema`）。`era` / `region` は空文字を送信するとフィールドが削除される。

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
  - 削除ポリシー: RETAIN（データ保持）
- **Pieces**: `classical-music-pieces`
  - 削除ポリシー: RETAIN（データ保持）
- **ConcertLogs**: `classical-music-concert-logs`
  - 削除ポリシー: prod は RETAIN、stg/dev は DESTROY
- **Composers**: `classical-music-composers`
  - 削除ポリシー: RETAIN（データ保持）

#### Lambda

- **ランタイム**: Node.js 24.x
- **関数数**: 26個
  - 視聴ログ用 CRUD 操作 × 5
  - 楽曲マスタ用 CRUD 操作 × 5
  - 作曲家マスタ用 CRUD 操作 × 5
  - 認証系 × 5（register・login・verify-email・resend-verification-code・refresh）
  - PreSignUp トリガー × 1
  - コンサート記録 × 5（list・create・get・update・delete）
- **環境変数**:
  - `DYNAMO_TABLE_LISTENING_LOGS`
  - `DYNAMO_TABLE_PIECES`
  - `DYNAMO_TABLE_CONCERT_LOGS`
  - `DYNAMO_TABLE_COMPOSERS`
  - `COGNITO_USER_POOL_ID`（認証系 Lambda で使用）
  - `COGNITO_CLIENT_ID`（認証系 Lambda で使用）

#### Cognito

- **User Pool**: メールアドレスベースのサインアップ/サインイン
- **自己登録**: 有効（`selfSignUpEnabled: true`）
- **メール確認**: 必須（確認コードをメール送信）
- **パスワードポリシー**: 8文字以上、大文字・小文字・数字を必須
- **App Client**: SRP 認証フロー（シークレットなし）
- **CDK Output**: `CognitoUserPoolId`, `CognitoClientId`, `CognitoUserPoolArn`
- **グループ**:
  - `admin`: 管理者グループ。CDK（`CfnUserPoolGroup`）で全環境に定義される
  - `admin` グループに所属するユーザーの ID Token には `cognito:groups: ["admin"]` クレームが付与される
  - グループの付与・剥奪は AWS CLI/コンソールによる手動運用（手順は `docs/OPERATIONS.md` 参照）

#### Route53

- **Hosted Zone**: `nocturne-app.com`（`NocturneAppDnsStack` で管理、us-east-1）
- **A レコード**: 各環境の CloudFront ディストリビューションへのエイリアスレコード
  - prod: `nocturne-app.com`
  - stg: `stg.nocturne-app.com`
  - dev: `dev.nocturne-app.com`

#### ACM (Certificate Manager)

- **証明書**: `nocturne-app.com` + `*.nocturne-app.com`（ワイルドカード）
- **リージョン**: us-east-1（CloudFront 用の証明書は us-east-1 に配置が必須）
- **検証方式**: DNS 検証（Route53 の Hosted Zone で自動検証）

#### API Gateway

- **名前**: `classical-music-lake`
- **ステージ**: `prod`
- **CORS**: カスタムドメイン URL を許可（プリフライト・GatewayResponse の両方で設定）
- **Cognito Authorizer 適用範囲**:
  - 認証必須: `/listening-logs/*`、`/concert-logs/*`、`/pieces` と `/composers` の書き込み系（`POST` / `PUT` / `DELETE`）
  - 認証不要: `/pieces` と `/composers` の参照系（`GET`）と `/auth/*`
  - 楽曲マスタ・作曲家マスタの書き込み系はさらに Lambda ハンドラ内で `admin` グループ判定を行い、非管理者には `403 Forbidden` を返す

#### S3

- **用途**: SPAの静的ファイルホスティング
- **パブリックアクセス**: ブロック（CloudFront経由のみ）
- **削除ポリシー**: DESTROY（自動削除）

#### CloudFront

- **用途**: SPAの配信
- **カスタムドメイン**: 環境ごとにカスタムドメインを設定（ACM 証明書を使用）
- **エラーハンドリング**: 404/403 → index.html（SPA対応）
- **プロトコル**: HTTPS強制

### 5.2 環境変数

#### フロントエンド

- `NUXT_PUBLIC_API_BASE_URL`: API GatewayのURL

#### バックエンド（Lambda）

- `DYNAMO_TABLE_LISTENING_LOGS`: 視聴ログテーブル名（CDK が自動設定）
- `DYNAMO_TABLE_PIECES`: 楽曲マスタテーブル名（CDK が自動設定）
- `DYNAMO_TABLE_CONCERT_LOGS`: コンサート記録テーブル名（CDK が自動設定）
- `DYNAMO_TABLE_COMPOSERS`: 作曲家マスタテーブル名（CDK が自動設定）
- `CORS_ALLOW_ORIGIN`: 許可する CORS オリジン（CDK がカスタムドメイン URL + CloudFront URL を自動設定。未設定時は `"*"` にフォールバックするが、本番・stg は CDK が必ず設定するため未設定にはならない）

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

| 環境   | スタック名                    | カスタムドメイン       | DynamoDB テーブル名（視聴ログ）      | DynamoDB テーブル名（コンサート記録） | 削除ポリシー | 用途                                     |
| ------ | ----------------------------- | ---------------------- | ------------------------------------ | ------------------------------------- | ------------ | ---------------------------------------- |
| `prod` | `ClassicalMusicLakeStack`     | `nocturne-app.com`     | `classical-music-listening-logs`     | `classical-music-concert-logs`        | RETAIN       | 本番環境                                 |
| `stg`  | `ClassicalMusicLakeStack-stg` | `stg.nocturne-app.com` | `classical-music-listening-logs-stg` | `classical-music-concert-logs-stg`    | DESTROY      | リリース前の検証環境                     |
| `dev`  | `ClassicalMusicLakeStack-dev` | `dev.nocturne-app.com` | `classical-music-listening-logs-dev` | `classical-music-concert-logs-dev`    | DESTROY      | 開発環境（ローカル環境からの接続も想定） |

> **DNS スタック**: `NocturneAppDnsStack`（us-east-1）は全環境で共有する Route53 Hosted Zone と ACM 証明書を管理する。初回のみ手動デプロイが必要（`npx cdk deploy NocturneAppDnsStack`）。

### 6.2 デプロイフロー

```text
GitHub (main branch push)    → stg 自動デプロイ
GitHub (release published)   → prod 自動デプロイ
GitHub (dev* タグ push)      → dev 自動デプロイ
GitHub (workflow_dispatch)   → dev / stg / prod を手動選択
  → GitHub Actions
    → CDK Bootstrap (ap-northeast-1 + us-east-1)
    → CDK デプロイ (STAGE_NAME 環境変数で対象スタックを指定)
      → Lambda + API Gateway + DynamoDB 作成/更新
      → S3 + CloudFront 作成/更新（カスタムドメイン + ACM 証明書）
      → Route53 A レコード作成/更新
    → スタック出力取得（API URL・Cognito ドメイン等）
    → Nuxt ビルド (pnpm run generate)
    → Storybook ビルド
    → S3 同期（SPA + Storybook）
    → CloudFront キャッシュ無効化
```

### 6.3 GitHub Actions

#### deploy.yml（デプロイ）

- **トリガー**:
  - `push to main` → stg 環境へ自動デプロイ
  - `release published` → prod 環境へ自動デプロイ
  - `push dev* tag` → dev 環境へ自動デプロイ
  - `workflow_dispatch` → dev / stg / prod を選択してデプロイ
- **Secrets**:
  - `AWS_ROLE_TO_ASSUME`
  - `GOOGLE_CLIENT_ID`（Google OAuth 用）
  - `GOOGLE_CLIENT_SECRET`（Google OAuth 用）

#### sync-db.yml（DB 同期）

- **概要**: prod の DynamoDB データを stg へ全件コピーする
- **対象テーブル**:
  - `classical-music-pieces` → `classical-music-pieces-stg`
  - ※ 視聴ログ（`classical-music-listening-logs`）・コンサート記録（`classical-music-concert-logs`）は個人情報を含むため同期対象外
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
- pnpm（`corepack enable` で有効化）
- AWS CLI
- AWS CDK CLI

### 7.2 ローカル開発

#### フロントエンド起動

```bash
# 依存パッケージインストール
pnpm install

# 環境変数設定
export NUXT_PUBLIC_API_BASE_URL=https://your-api-url/prod

# 開発サーバー起動
pnpm run dev
```

#### バックエンド開発

```bash
cd backend
pnpm install
# Lambda関数は AWS SAM や Serverless Framework でローカルテスト可能
```

#### インフラデプロイ

```bash
cd cdk
pnpm install
cdk bootstrap  # 初回のみ
cdk deploy
```

---

## 8. 型定義管理方針

### 8.1 フロント・バックエンド共通型の管理

フロントエンド（`app/types/index.ts`）とバックエンド（`backend/src/types/index.ts`）はパッケージが分離されているため、共有型は両ファイルに重複定義する。ただし、フロント・バックエンドで共通の定数・型は `shared/` ディレクトリに一元管理し、各パッケージの型定義ファイルから re-export する。

#### 共通定数（`shared/` で一元管理）

| 定数名・型名       | ファイル              | 説明                                           |
| ------------------ | --------------------- | ---------------------------------------------- |
| `PIECE_GENRES`     | `shared/constants.ts` | ジャンルの値定数配列（型 `PieceGenre` を導出） |
| `PIECE_ERAS`       | `shared/constants.ts` | 時代の値定数配列（型 `PieceEra` を導出）       |
| `PIECE_FORMATIONS` | `shared/constants.ts` | 編成の値定数配列（型 `PieceFormation` を導出） |
| `PIECE_REGIONS`    | `shared/constants.ts` | 地域の値定数配列（型 `PieceRegion` を導出）    |

> `app/types/index.ts` と `backend/src/types/index.ts` の両方から re-export されるため、既存のインポートパスは変更不要。

#### 共有型（両ファイルで同一定義を維持すること）

| 型名・定数名              | 説明                                                       |
| ------------------------- | ---------------------------------------------------------- |
| `Rating`                  | 評価値（1〜5 の整数）                                      |
| `ApiErrorResponse`        | APIエラーレスポンスのボディ                                |
| `ListeningLog`            | 鑑賞ログ                                                   |
| `CreateListeningLogInput` | 鑑賞ログ作成入力                                           |
| `UpdateListeningLogInput` | 鑑賞ログ更新入力                                           |
| `Piece`                   | 楽曲マスタ                                                 |
| `CreatePieceInput`        | 楽曲マスタ作成入力                                         |
| `UpdatePieceInput`        | 楽曲マスタ更新入力                                         |
| `ConcertLog`              | コンサート記録（`title` は必須フィールド）                 |
| `CreateConcertLogInput`   | コンサート記録作成入力                                     |
| `UpdateConcertLogInput`   | コンサート記録更新入力（`Partial<CreateConcertLogInput>`） |
| `Composer`                | 作曲家マスタ                                               |
| `CreateComposerInput`     | 作曲家マスタ作成入力                                       |
| `UpdateComposerInput`     | 作曲家マスタ更新入力（`Partial<CreateComposerInput>`）     |

#### バックエンド固有（`backend/src/types/index.ts` にのみ存在）

| 関数名・型名    | 説明                                                     |
| --------------- | -------------------------------------------------------- |
| `isValidRating` | Rating のバリデーション関数（Lambda 内バリデーション用） |

#### 変更時のチェックリスト

1. 共通定数・型を変更する場合、`shared/` のファイルを編集する（re-export により両パッケージに自動反映）
2. 共有型を変更する場合、`app/types/index.ts` と `backend/src/types/index.ts` の両方を更新する
3. バックエンド固有の型・関数はバックエンド側にのみ追加し、フロントエンド側には移植しない
4. フロントエンド固有の型はフロントエンド側にのみ追加し、バックエンド側には移植しない

---

## 9. 制限事項・今後の課題

### 9.1 現在の制限

- **認証**: メールアドレス・パスワード認証および Google OAuth（Cognito Hosted UI 経由）を実装済み。Apple Sign-In 等は未実装
- **MFA なし**: 多要素認証は将来フェーズで実装予定
- **検索機能なし**: DynamoDB Scanのみ
- **ページネーション（フロント向け）**: 楽曲マスタ（`GET /pieces`）はカーソル型ページング + 無限スクロールに対応済み。視聴ログ・コンサート記録は未対応（将来フェーズで同方式に展開予定）
- **画像アップロードなし**: テキストベースのみ

### 9.2 将来的な拡張案

- ソーシャルログイン拡張（Apple Sign-In 等）
- 多要素認証（MFA）
- 全文検索（OpenSearch等）
- ページネーション
- アルバムカバー画像の管理
- タグ・カテゴリ機能
- データのエクスポート機能
- 統計・分析ダッシュボード
