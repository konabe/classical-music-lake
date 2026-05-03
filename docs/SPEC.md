# Nocturne - システム仕様書

## 1. システム概要

### 1.1 目的

クラシック音楽の鑑賞体験を記録・管理するためのWebアプリケーション。

### 1.2 主要機能

- **視聴ログ管理**: CD・配信サービス等で聴いた録音の記録。詳細ページでは作曲家名から作曲家マスタ詳細へリンク（マスタに同名の作曲家が存在する場合のみ）
- **視聴ログの検索・統計**: クライアントサイド絞り込みと、件数・評価分布・作曲家ランキング・月別トレンドの集計表示
- **コンサート記録管理**: 会場・指揮者・オーケストラ・ソリスト・プログラム（楽曲マスタ参照）
- **楽曲マスタ管理**: 楽曲の登録・編集・削除（管理者のみ）
- **作曲家マスタ管理**: 作曲家の登録・編集・削除（管理者のみ）。生没年を登録すると一覧は生年昇順（古い順）で表示され、未登録は末尾に並ぶ。詳細ページではその作曲家の楽曲一覧（クライアントサイド絞り込み）も表示
- **ユーザー登録**: メールアドレス＋パスワード（メール確認付き）／Google OAuth（Cognito Hosted UI）

### 1.3 想定ユーザー

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

- **フレームワーク**: Nuxt 3 (Vue 3) / TypeScript / SPA (SSR無効)
- **ホスティング**: S3 + CloudFront

#### フロントエンド Composables

| Composable                  | 役割                                                                                                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useApiBase`                | API Gateway のベース URL を返す                                                                                                                                               |
| `useCognitoConfig`          | Cognito Hosted UI のドメインとクライアント ID を返す                                                                                                                          |
| `useAuth`                   | 認証処理（register・login・logout・isAuthenticated・refreshTokens・isTokenExpired・loginWithGoogle・handleOAuthCallback・isAdmin）                                            |
| `usePieces`                 | 曲一覧を取得する                                                                                                                                                              |
| `useRatingDisplay`          | 評価値（0〜5）を星文字列に変換する (`ratingStars`)                                                                                                                            |
| `useConcertLogs`            | コンサート記録の一覧取得（`list`）・作成（`create`）・更新（`update`）・削除（`deleteLog`）。401 時にトークンリフレッシュを自動試行                                           |
| `useConcertLog`             | 特定のコンサート記録を id で取得する（詳細ページ用）                                                                                                                          |
| `useComposersAll`           | 作曲家マスタ一覧を 1 回の Scan で全件取得（`COMPOSERS_PAGE_SIZE_MAX=1000` 想定）し、作成・更新・削除の書き込み系もまとめて提供する。書き込み成功時は内部で `refresh()` を実行 |
| `useComposer`               | 特定の作曲家を id で取得する（詳細ページ用）                                                                                                                                  |
| `useSubmitHandler`          | フォーム送信時の `try/catch` とエラーメッセージ設定・成功後の `navigateTo` 遷移を共通化する                                                                                   |
| `useListeningLogFilter`     | 視聴ログ一覧のクライアントサイド絞り込み状態（キーワード／評価／お気に入りのみ／開始日／終了日）を管理し、フィルタ済みリストと `isActive` / `reset` を返す                    |
| `useListeningLogStatistics` | 視聴ログ配列から総数・お気に入り数・平均評価・評価分布・作曲家ランキング（既定 5 件）・月別トレンド（既定直近 12 ヶ月）を計算する                                             |

#### フロントエンド レイアウト

| レイアウト | 役割                                                                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`  | グローバルヘッダー（マストヘッド）を含む基本レイアウト。ナビゲーションは「鑑賞記録」「楽曲マスタ」「作曲家マスタ」「コンサート記録」。認証状態に応じて右側リンクを切り替える。ヘッダー右端に `ThemeToggle` を配置 |
| `auth`     | 認証ページ（`/auth/login`・`/auth/user-register`・`/auth/verify-email`）用。ホームへ戻れるロゴ付きの最小ヘッダーとフォーム用の中央寄せメイン領域を提供。ヘッダー右端に `ThemeToggle` を配置                       |

#### フロントエンド ユーティリティ

| ユーティリティ | 役割                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `video.ts`     | YouTube URL の判定（`isYouTubeUrl`）、動画 ID 抽出（`extractYouTubeVideoId`）、埋め込み URL 変換（`toYouTubeEmbedUrl`） |

#### デザインシステム — Editorial Quarterly

ヴィンテージ雑誌（The New Yorker / Le Monde diplomatique）の佇まいを参考にしたエディトリアル路線。ネイビー × アイボリー × シャンパンゴールドを基調に、ボルドーを補助アクセントに据える。

- **タイポグラフィ**: ディスプレイ `Fraunces` / 本文・UI `Inter Tight` / 引用 `Cormorant Garamond`。Google Fonts を `app/assets/css/fonts.css` で読み込む
- **カラー / トークン**: `app/assets/css/theme.css` の `:root.light` / `:root.dark` に CSS 変数で定義（`--color-bg-base` / `--color-bg-paper` / `--color-accent`（シャンパンゴールド） / `--color-bordeaux` / `--color-hairline` 等の意味的トークン）。コンポーネントは `var(--xxx)` で参照する
- **テーマ切替**: [`@nuxtjs/color-mode`](https://color-mode.nuxtjs.org/) を採用。`<html>` に `light` / `dark` クラス、`storageKey: "nocturne-color-mode"` で localStorage に永続化。`preference: "system"` で初回は OS 設定追従、`fallback: "light"`
- **マストヘッド**: `default` レイアウトで雑誌風の 2 段ヘッダー（号数表示・ナンバリング付きナビ・ゴールドのヘアライン）を採用。`auth` レイアウトは別マストヘッド + 4 隅ゴールドコーナー枠の `AuthFormContainer` + サイドマーク "Nº01"
- **モーション**: ページ遷移（フェード + 微小なリフト）と `.stagger-children`（子要素を順次フェードイン）を CSS で定義。`prefers-reduced-motion: reduce` でアニメーションを無効化
- **`.smallcaps` / `.numeric`**: `app.vue` のグローバルクラス。雑誌風キャプションとタブラー数字に使用

> 詳細な CSS 変数値・装飾パターンは `app/assets/css/theme.css` と `app.vue` を参照。

#### バックエンド

- **ランタイム**: Node.js 24.x / TypeScript
- **API**: REST API (API Gateway + Lambda)
- **データベース**: DynamoDB
- **認証**: AWS Cognito User Pool (メールアドレスベースのサインアップ/サインイン)

#### インフラ

- **IaC**: AWS CDK (TypeScript)
- **CI/CD**: GitHub Actions

---

## 3. データモデル

### 3.1 視聴ログ (ListeningLog)

- **テーブル名**: `classical-music-listening-logs`
- **PK**: `id` (String) / **GSI1**: `userId` + `createdAt` — ユーザー別一覧取得に使用
- **削除ポリシー**: 全環境 RETAIN

```typescript
type Rating = 1 | 2 | 3 | 4 | 5;

interface ListeningLog {
  id: string; // UUID (自動生成)
  userId: string | null; // Cognito sub（未帰属データは null）
  listenedAt: string; // 視聴日時 (ISO 8601、UTC、Zサフィックス必須)
  composer: string; // 作曲家名（最大100文字、空白のみ不可）
  piece: string; // 曲名（最大200文字、空白のみ不可）
  rating: Rating; // 評価 (1〜5の整数)
  isFavorite: boolean;
  memo?: string; // 任意、最大1000文字
  createdAt: string;
  updatedAt: string;
}
```

> `listenedAt` は `datetime-local` 入力値をローカル時刻として `toISOString()` で変換して送信する。

### 3.2 楽曲マスタ (Piece)

- **テーブル名**: `classical-music-pieces`
- **PK**: `id` (String)
- **削除ポリシー**: 全環境 RETAIN

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
  id: string;
  title: string; // 曲名（最大200文字、空白のみ不可）
  composerId: string; // 作曲家マスタ（Composer）の id 参照（UUID 形式のみ検証）
  videoUrls?: string[]; // 任意、最大10件、URL 形式
  genre?: PieceGenre;
  era?: PieceEra;
  formation?: PieceFormation;
  region?: PieceRegion;
  createdAt: string;
  updatedAt: string;
}
```

> **マイグレーション履歴**:
>
> - 2026-04: `composer`（自由入力）→ `composerId`（参照）。旧データは `backend/src/migrations/piece-composer-id/index.ts` で一括変換（`MigrationsStack` に分離。詳細は `docs/OPERATIONS.md`）
> - 2026-05: `videoUrl`（単一）→ `videoUrls`（配列）。`DynamoDBPieceRepository` の読み込み時に透過的に正規化されるため、明示的な移行 Lambda は持たない

> **任意項目の更新**: `era` / `genre` / `formation` / `region` は更新時に空文字を送信するとフィールドが削除される。`videoUrls` は空配列 `[]` で削除。

### 3.3 作曲家マスタ (Composer)

- **テーブル名**: `classical-music-composers`
- **PK**: `id` (String)
- **削除ポリシー**: 全環境 RETAIN

```typescript
interface Composer {
  id: string;
  name: string; // 作曲家名（最大100文字、空白のみ不可）
  era?: PieceEra; // 任意、楽曲マスタと共通の定数を流用
  region?: PieceRegion; // 任意、楽曲マスタと共通の定数を流用
  imageUrl?: string; // 任意、URL 形式（Wikimedia Commons 等のパブリックドメイン画像を想定）
  birthYear?: number; // 任意、整数（西暦。BC は負数）。範囲は -3000 〜 9999
  deathYear?: number; // 任意、整数。存命作曲家は未指定
  createdAt: string;
  updatedAt: string;
}
```

> 任意項目（`era` / `region` / `imageUrl`）は更新時に空文字を送信するとフィールドが削除される。`birthYear` / `deathYear` は更新時に `null` を送信するとフィールドが削除される。

### 3.4 コンサート記録 (ConcertLog)

- **テーブル名**: `classical-music-concert-logs`
- **PK**: `id` (String) / **GSI1**: `userId` + `createdAt` — ユーザー別一覧取得に使用
- **削除ポリシー**: prod は RETAIN、stg/dev は DESTROY

```typescript
interface ConcertLog {
  id: string;
  userId: string; // Cognito sub（認証必須のため null なし）
  title: string; // コンサート名（最大200文字、空白のみ不可）
  concertDate: string; // 開催日時 (ISO 8601、UTC、Zサフィックス必須)
  venue: string; // 会場名（最大200文字、空白のみ不可）
  conductor?: string; // 任意、最大100文字
  orchestra?: string; // 任意、最大100文字
  soloist?: string; // 任意、最大100文字
  pieceIds?: string[]; // 楽曲マスタ ID の配列（演奏順）。空配列許容
  createdAt: string;
  updatedAt: string;
}
```

> 全データモデルのバリデーションは `backend/src/utils/schemas.ts` の Zod スキーマで実施し、`parseRequestBody` のパース処理と統合されている。`updateXxxSchema` は `createXxxSchema.partial()` により全フィールド任意。

---

## 4. API仕様

> エンドポイントの正準仕様は **`docs/openapi.yaml`** を参照。ここでは概略と認可方針のみ記載する。

### 4.1 エンドポイント構成

- **ベースURL**: `https://{api-gateway-url}/prod`
- **認証**: AWS Cognito User Pool (Bearer Token)
- **認可マトリクス**:
  | エンドポイント | 認証 | 追加要件 |
  | ---------------------------------- | -------- | --------------- |
  | `/auth/*` | 不要 | — |
  | `GET /pieces` / `GET /pieces/{id}` | 不要 | — |
  | `GET /composers` / `GET /composers/{id}` | 不要 | — |
  | `/listening-logs/*` | 必須 | 自データのみ |
  | `/concert-logs/*` | 必須 | 自データのみ |
  | `POST/PUT/DELETE /pieces` | 必須 | `admin` グループ |
  | `POST/PUT/DELETE /composers` | 必須 | `admin` グループ |
- **CORS**: カスタムドメイン URL のみ許可（プリフライト・GatewayResponse の両方で設定。dev のみ `http://localhost:3010` を追加）
- **エラーレスポンス形式**: `{ "message": "..." }` / 一部認証 API は `{ "error": "...", "message": "..." }`

### 4.2 認証API

| エンドポイント                        | 概要                                                                              | 主なエラー                                                 |
| ------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `POST /auth/register`                 | Cognito ユーザー登録、確認コードをメール送信                                      | 400 (バリデーション) / 409 (既存ユーザー)                  |
| `POST /auth/verify-email`             | 確認コードを検証してアカウント有効化                                              | 400 `CodeMismatch` / `ExpiredCode` / `NotAuthorized` / 429 |
| `POST /auth/resend-verification-code` | 確認コードを再送信                                                                | 400 `UserAlreadyConfirmed` / `UserNotFound` / 429          |
| `POST /auth/login`                    | メール+パスワード認証、JWT トークン一式を返す                                     | 401 `InvalidCredentials` / 403 `UserNotConfirmed` / 429    |
| `POST /auth/refresh`                  | リフレッシュトークンでアクセス・ID トークンを更新                                 | 401 `InvalidRefreshToken` / 429                            |
| `GET /auth/callback`（Hosted UI）     | Google OAuth コールバック。フロントが認可コードをトークン交換し localStorage 保存 | —                                                          |

#### パスワードルール（Cognito User Pool 設定）

- 8 文字以上、大文字・小文字・数字をそれぞれ 1 文字以上含む

#### メール未確認時のログインフロー

1. バックエンドが `403 / UserNotConfirmed` を返す
2. フロントエンドが入力パスワードを `sessionStorage.pendingPassword` に保存
3. `/auth/verify-email` へリダイレクト（`history.state.email` でメールアドレスを渡す）
4. 確認コード入力 → 確認完了 → 自動ログイン → トップへ遷移

### 4.3 視聴ログ API（`/listening-logs`）

- **CRUD**: `GET /listening-logs` / `GET /listening-logs/{id}` / `POST /listening-logs` / `PUT /listening-logs/{id}` / `DELETE /listening-logs/{id}`
- **ソート順**: `listenedAt` 降順（新しい順）
- **アクセス制御**: GSI1（`userId` + `createdAt`）でユーザースコープに絞り込み。他ユーザーのアイテムへのアクセスは `404 Not Found`（存在を隠蔽）
- **更新**: 部分更新（Partial Update）。`id` / `createdAt` / `userId` は不変、`updatedAt` は自動更新
- **自動生成**: `id`（UUID v4）/ `userId`（Cognito sub）/ `createdAt` / `updatedAt`

### 4.4 コンサート記録 API（`/concert-logs`）

- **CRUD**: `GET /concert-logs` / `GET /concert-logs/{id}` / `POST /concert-logs` / `PUT /concert-logs/{id}` / `DELETE /concert-logs/{id}`
- **ソート順**: `concertDate` 降順
- **アクセス制御**: GSI1（`userId` + `createdAt`）でユーザースコープに絞り込み
- 認可・自動生成・更新ルールは視聴ログと同様

### 4.5 楽曲マスタ API（`/pieces`）

- **参照**: `GET /pieces`（カーソル型ページング）/ `GET /pieces/{id}`。**認証不要**
- **書き込み**: `POST` / `PUT /{id}` / `DELETE /{id}`。**`admin` グループ必須**
  - 認証ヘッダーなし: `401 Unauthorized`（API Gateway Authorizer）
  - 認証済みだが非 admin: `403 Forbidden` + `{ "message": "Admin privilege required" }`

#### `GET /pieces` カーソル型ページング

| クエリ   | 既定 | 制約                                     |
| -------- | ---- | ---------------------------------------- |
| `limit`  | 50   | 1〜100、範囲外は `400 Bad Request`       |
| `cursor` | なし | 前回 `nextCursor` を渡す。不正値は `400` |

レスポンス: `{ "items": Piece[], "nextCursor": "opaque-base64url" | null }`。`nextCursor` 無しで終端。

**カーソル仕様**: `base64url(JSON.stringify({ v: 1, k: LastEvaluatedKey }))` の不透明文字列。形式は Zod の `z.base64url()` で検証、デコード後の不正・未知バージョンは `decodeCursor` で検出して 400。**HMAC は付与しない**（楽曲マスタは全ユーザ共通でテナント境界を越えるリスク無し）。

**ソート順**: DynamoDB Scan の戻り順（順不同）。

### 4.6 作曲家マスタ API（`/composers`）

楽曲マスタ API と同様の構造。認可ルール・カーソル型ページング仕様も同等（`limit` の最大値は 1000）。書き込み API の更新時に楽観的ロックが失敗すると `409 Conflict` + `{ "message": "Composer was updated by another request" }`。

> 一覧画面（フロント）は `useComposersAll` で 1 ページ（最大 1000 件）取得し、`birthYear` 昇順（生年未登録は末尾、name 昇順で安定化）にクライアントサイドでソートする。サーバー側にはソート順の保証がないため、件数が `useComposersAll` の上限を超える場合はサーバー側ソート（GSI 追加）への移行を要する。

### 4.7 共通エラーレスポンス

| ステータス                  | 意味           | 主な発生条件                                       |
| --------------------------- | -------------- | -------------------------------------------------- |
| `400 Bad Request`           | リクエスト不正 | バリデーション失敗、不正なパスパラメータ・カーソル |
| `401 Unauthorized`          | 未認証         | 認証必須エンドポイントでトークンが不正・期限切れ   |
| `403 Forbidden`             | 権限不足       | 認証済みだが `admin` 非所属、`UserNotConfirmed`    |
| `404 Not Found`             | 未存在         | 指定 ID 未存在 or 他ユーザーのアイテム（存在隠蔽） |
| `409 Conflict`              | 競合           | 既存ユーザー登録、楽観的ロック競合                 |
| `429 Too Many Requests`     | 過多           | 認証 API のレート制限                              |
| `500 Internal Server Error` | サーバー内部   | DynamoDB 接続エラーなど予期しないエラー            |

---

## 5. インフラ構成

### 5.1 AWSリソース

#### DynamoDB

4 テーブル（`classical-music-{listening-logs,pieces,concert-logs,composers}`）。削除ポリシーは §3 の各データモデルを参照。課金モードは全てオンデマンド。

#### Lambda

- **ランタイム**: Node.js 24.x
- **関数数**: 26 個（本スタック。データ移行用 Lambda は `MigrationsStack` に分離）
  - 視聴ログ × 5 / 楽曲マスタ × 5 / 作曲家マスタ × 5 / コンサート記録 × 5 / 認証系 × 5（register・login・verify-email・resend-verification-code・refresh）/ PreSignUp トリガー × 1
- **環境変数**: `DYNAMO_TABLE_{LISTENING_LOGS,PIECES,CONCERT_LOGS,COMPOSERS}`、`COGNITO_USER_POOL_ID` / `COGNITO_CLIENT_ID`（認証系のみ）、`CORS_ALLOW_ORIGIN`

#### Cognito

- **User Pool**: メールアドレスベースのサインアップ/サインイン、自己登録有効、メール確認必須、パスワード 8 文字以上で大文字・小文字・数字必須
- **App Client**: SRP 認証フロー（シークレットなし）
- **CDK Output**: `CognitoUserPoolId` / `CognitoClientId` / `CognitoUserPoolArn`
- **グループ**: `admin`（CDK の `CfnUserPoolGroup` で全環境に定義）。所属ユーザーの ID Token に `cognito:groups: ["admin"]` クレーム付与。**付与・剥奪は AWS CLI/コンソールによる手動運用**（手順は `docs/OPERATIONS.md`）

#### Route53 / ACM

- **Hosted Zone**: `nocturne-app.com`（`NocturneAppDnsStack`、us-east-1、全環境共有）
- **A レコード**: prod=`nocturne-app.com` / stg=`stg.nocturne-app.com` / dev=`dev.nocturne-app.com`
- **証明書**: `nocturne-app.com` + `*.nocturne-app.com`（ワイルドカード、us-east-1、DNS 検証）

#### API Gateway

- **名前**: `classical-music-lake` / **ステージ**: `prod`
- **認可**: §4.1 の認可マトリクス参照。書き込み系 API はさらに Lambda ハンドラ内 `requireAdmin(event)` で `admin` グループ判定を行う二段構え

#### S3 / CloudFront

- S3: SPA の静的ホスティング、パブリックアクセスはブロック（CloudFront 経由のみ）、削除ポリシー DESTROY
- CloudFront: カスタムドメイン + ACM 証明書、`404/403` → `index.html`（SPA 対応）、HTTPS 強制

#### CloudWatch アラーム / SNS

各環境のメインスタックでアラームと通知用 SNS トピックを作成。詳細手順は `docs/OPERATIONS.md` の「監視・アラート設定」を参照。

- **SNS トピック**: `classical-music-lake-<stage>-alerts`（CDK 出力 `AlertTopicArn`）
- **メール購読**: CDK デプロイ時の `ALERT_EMAIL`（カンマ区切り）から自動作成。未指定時はサブスクリプションなし
- **アラーム**: Lambda Errors（関数ごと）/ API Gateway 5XX / API Gateway Latency p99 (3000ms 超 × 2 期間) / DynamoDB ThrottledRequests / DynamoDB SystemErrors。各アラームは ALARM / OK の両状態を SNS に送信

### 5.2 環境変数

#### フロントエンド

- `NUXT_PUBLIC_API_BASE_URL`: API Gateway の URL

#### バックエンド（Lambda）

CDK が自動設定。詳細は §5.1 参照。秘密情報は含まれない（テーブル名・CORS オリジンのみ）。

#### CI/CD（GitHub Secrets）

| シークレット名         | 用途                                                                              |
| ---------------------- | --------------------------------------------------------------------------------- |
| `AWS_ROLE_TO_ASSUME`   | GitHub OIDC で AssumeRole する IAM ロール ARN                                     |
| `GOOGLE_CLIENT_ID`     | Google OAuth 用                                                                   |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 用                                                                   |
| `ALERT_EMAIL`          | CloudWatch アラート通知先メールアドレス（任意、カンマ区切り。未設定時は購読なし） |

> **シークレット管理方針**: CI/CD 認証は GitHub Actions OIDC + IAM Role Assume によるキーレス認証。長期 AWS アクセスキーは使用しない。Lambda 環境変数に秘密情報は含まれない。
>
> **IAM 信頼ポリシー要件**: 信頼ポリシーには `Action: sts:AssumeRoleWithWebIdentity` と `token.actions.githubusercontent.com:aud=sts.amazonaws.com`、`token.actions.githubusercontent.com:sub=repo:<org>/<repo>:ref:refs/heads/<branch>` の Condition を必ず設定する。

---

## 6. デプロイメント

### 6.1 環境構成

| 環境   | スタック名                    | カスタムドメイン       | DynamoDB（視聴ログ／コンサート記録）                                      | 削除ポリシー（コンサート） |
| ------ | ----------------------------- | ---------------------- | ------------------------------------------------------------------------- | -------------------------- |
| `prod` | `ClassicalMusicLakeStack`     | `nocturne-app.com`     | `classical-music-listening-logs` / `classical-music-concert-logs`         | RETAIN                     |
| `stg`  | `ClassicalMusicLakeStack-stg` | `stg.nocturne-app.com` | `classical-music-listening-logs-stg` / `classical-music-concert-logs-stg` | DESTROY                    |
| `dev`  | `ClassicalMusicLakeStack-dev` | `dev.nocturne-app.com` | `classical-music-listening-logs-dev` / `classical-music-concert-logs-dev` | DESTROY                    |

> **DNS スタック**: `NocturneAppDnsStack`（us-east-1）は全環境共有の Route53 / ACM を管理。初回のみ手動デプロイが必要（`npx cdk deploy NocturneAppDnsStack`）。

### 6.2 GitHub Actions

#### deploy.yml

- **トリガー**: `push to main` → stg 自動／`release published` → prod 自動／`push dev*` タグ → dev 自動／`workflow_dispatch` → dev/stg/prod を選択
- **処理**: CDK Bootstrap (ap-northeast-1 + us-east-1) → CDK デプロイ → スタック出力取得（API URL・Cognito ドメイン等）→ Nuxt + Storybook ビルド → S3 同期 → CloudFront キャッシュ無効化

#### sync-db.yml（DB 同期）

- **概要**: prod の DynamoDB データを stg へ全件コピーする
- **対象**: `pieces` / `composers` のみ（視聴ログ・コンサート記録は個人情報のため対象外）
- **トリガー**: 毎日 0:00 JST（UTC 15:00）の自動実行 + `workflow_dispatch`
- **動作**: stg テーブルの既存データを全件削除 → prod の全データを `BatchWriteItem`（25 件単位）で stg へ書き込み → UnprocessedItems は指数バックオフで最大 5 回リトライ

### 6.3 ロールバック

CloudFormation はデプロイ失敗時に自動ロールバックする。手動ロールバック・S3 のバージョン復元手順は `docs/OPERATIONS.md` を参照。基本は `git revert <commit-hash> && git push origin main` で再デプロイするのが最も確実。

---

## 7. 開発環境

### 7.1 必須ツール

- Node.js 24.x 以上 / pnpm（`corepack enable`）/ AWS CLI / AWS CDK CLI

### 7.2 ローカル開発

```bash
# フロント起動
pnpm install
export NUXT_PUBLIC_API_BASE_URL=https://your-api-url/prod
pnpm run dev

# バック（Lambda はローカル実行不可。テスト中心）
cd backend && pnpm install && pnpm test

# インフラ
cd cdk && pnpm install && cdk bootstrap && cdk deploy
```

---

## 8. 型定義管理方針

### 8.1 フロント・バックエンド共通型の管理

フロントエンド（`app/types/index.ts`）とバックエンド（`backend/src/types/index.ts`）はパッケージが分離されているため、共有型は両ファイルに重複定義する。ただしフロント・バックエンドで共通の定数・型は `shared/` ディレクトリに一元管理し、各パッケージの型定義ファイルから re-export する。

#### 共通定数（`shared/constants.ts` で一元管理）

| 定数名             | 導出される型     | 内容                 |
| ------------------ | ---------------- | -------------------- |
| `PIECE_GENRES`     | `PieceGenre`     | ジャンルの値定数配列 |
| `PIECE_ERAS`       | `PieceEra`       | 時代の値定数配列     |
| `PIECE_FORMATIONS` | `PieceFormation` | 編成の値定数配列     |
| `PIECE_REGIONS`    | `PieceRegion`    | 地域の値定数配列     |

#### 共有型（両ファイルで同一定義を維持すること）

`Rating` / `ApiErrorResponse` / `ListeningLog` / `CreateListeningLogInput` / `UpdateListeningLogInput` / `Piece` / `CreatePieceInput` / `UpdatePieceInput` / `ConcertLog` / `CreateConcertLogInput` / `UpdateConcertLogInput` / `Composer` / `CreateComposerInput` / `UpdateComposerInput`。`Update*Input` は `Partial<Create*Input>` で導出。

#### バックエンド固有

- `isValidRating`（Rating のバリデーション関数、Lambda 内バリデーション用）

#### 変更時のチェックリスト

1. 共通定数・型を変更する場合、`shared/` のファイルを編集する（re-export により両パッケージに自動反映）
2. 共有型を変更する場合、`app/types/index.ts` と `backend/src/types/index.ts` の両方を更新する
3. パッケージ固有の型・関数は片側にのみ追加する

### 8.2 ID 値オブジェクト（バックエンドのみ）

エンティティ ID を DDD の値オブジェクトとして表現し、異種 ID の取り違え（例: `PieceId` を `ComposerId` として渡す）を TypeScript の型検査で防ぐ。定義箇所は `backend/src/domain/value-objects/ids.ts`。

| クラス           | 用途                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- |
| `ListeningLogId` | 鑑賞ログの ID                                                                            |
| `ConcertLogId`   | コンサート記録の ID                                                                      |
| `PieceId`        | 楽曲マスタの ID（コンサート記録 `pieceIds` 参照にも使用）                                |
| `ComposerId`     | 作曲家マスタの ID（楽曲マスタ `composerId` 参照にも使用）                                |
| `UserId`         | Cognito sub を表す。外部 IdP 発行のため `generate()` は持たず `from(value)` のみ提供する |

- 共通基底 `IdValueObject` を継承し、`private readonly __brand` で nominal typing（subclass 間で代入不可）
- 生成系は `Xxx.generate()`（UUID v4 採番）と `Xxx.from(value)`（既存文字列からの復元）の 2 つ
- 厳密な UUID 形式検証は行わない（後方互換性のため）。空文字・非文字列のみ拒否。UUID 形式の検証は Zod スキーマ（`z.uuid()`）が担う
- 値の取り出しは `.value` または `toString()`、等価判定は `.equals(other)`

#### レイヤー境界との関係

- **domain**: エンティティの内部 props が ID を VO で保持（例: `PieceEntity.props.composerId` は `ComposerId`）。`create()` で `Xxx.generate()`、`reconstruct()` で文字列を VO に変換。`toPlain()` で `.value` に戻す
- **usecases**: メソッド引数を VO で受け取り、Repository にも VO のまま渡す
- **handlers**: パスパラメータ・認証情報から `getIdParam(event, XxxId.from)` / `getUserId(event)` で組み立てる
- **repositories**: I/F は VO、内部実装で `.value` に変換して DynamoDB Key/GSI へ渡す。戻り値は string ベース DTO（Entity 復元は usecase 層）

> `handlers/` 層から `domain/` への直接 import は ESLint で禁止のため、ID 値オブジェクトは各 usecase ファイルから re-export してハンドラに公開する。

### 8.3 エンティティ基底クラス（バックエンドのみ）

`backend/src/domain/entity.ts` の `Entity<TId, TProps>` 抽象クラスに「ID・タイムスタンプの保持」「等価性」を集約する。各エンティティ（`ListeningLogEntity` / `ConcertLogEntity` / `PieceEntity` / `ComposerEntity`）はこれを継承。

- `protected readonly props: TProps`: 派生クラスの内部状態。`TProps extends EntityProps<TId> = { id: TId; createdAt: string; updatedAt: string }`
- `get id(): TId` / `get createdAt(): string` / `get updatedAt(): string`: 共通アクセサ
- `equals(other: unknown)`: 「同じ具象クラス」かつ「同じ ID」のとき `true`。異なる派生クラス同士は `false`
- 派生クラスの規約: `private constructor(props)` で `super(props)` を呼ぶ。`static create()` / `static reconstruct()` ファクトリは個別実装。`toPlain()` / `isOwnedBy()` / `mergeUpdate()` は派生クラスで実装

### 8.4 その他の値オブジェクト（バックエンドのみ）

ID 以外のドメイン概念も不変条件を VO で保証する。すべて `backend/src/domain/value-objects/` 配下。

| クラス         | 不変条件                                    | 利用箇所                                             |
| -------------- | ------------------------------------------- | ---------------------------------------------------- |
| `Rating`       | 1〜5 の整数                                 | `ListeningLogEntity.props.rating`                    |
| `PieceTitle`   | 非空・最大 200 文字                         | `PieceEntity.props.title`                            |
| `ComposerName` | 非空・最大 100 文字                         | `ComposerEntity.props.name`                          |
| `Venue`        | 非空・最大 200 文字                         | `ConcertLogEntity.props.venue`                       |
| `Url`          | WHATWG URL パーサーで形式検証               | `Piece.videoUrls` 各要素 / `Composer.imageUrl`       |
| `Year`         | -3000〜9999 の整数（西暦。BC は負数で表現） | `ComposerEntity.props.birthYear` / `props.deathYear` |

- 生成は `Xxx.of(value)`。範囲外・文字列以外・空文字・形式不正は `RangeError` / `TypeError` を投げる
- テキスト系 VO は `value.trim()` を内部適用。最大長は Zod スキーマと数値を揃え二重検証
- `Url` はスキーム制限なし（Zod の `z.url()` と同等）。空文字は明示削除として VO 化前にハンドラ／ユースケース層で処理する
- DTO 境界（`types/index.ts`）は従来どおり primitive。VO はエンティティ内部の props 型としてのみ扱い、ハンドラ・ユースケース・リポジトリは引き続き string ベースの DTO を受け渡す

---

## 9. 制限事項・今後の課題

### 9.1 現在の制限

- 認証は メール+パスワード ／ Google OAuth（Hosted UI）のみ。Apple Sign-In・MFA 未対応
- サーバー側全文検索なし（DynamoDB Scan のみ）。視聴ログのみ `useListeningLogFilter` でクライアント絞り込み
- 統計はクライアント集計のみ（`useListeningLogStatistics`）
- ページネーションは楽曲マスタのみカーソル型対応。作曲家マスタは API は `limit/cursor` を受け取るが、フロントは件数規模が小さい前提で `useComposersAll`（1 回の Scan で全件取得 + 生年昇順クライアントソート）を採用しページング UI は持たない。視聴ログ・コンサート記録は未対応
- 画像アップロード未対応（テキストベースのみ）

### 9.2 将来的な拡張

ソーシャルログイン拡張 / MFA / OpenSearch 等によるサーバー側全文検索 / 視聴ログ・コンサート記録のページネーション / アルバムカバー画像 / タグ・カテゴリ機能 / データのエクスポート / サーバー側の高度な統計分析
