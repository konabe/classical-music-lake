# Nocturne - システム仕様書

## 1. システム概要

### 1.1 目的

クラシック音楽の鑑賞体験を記録・管理するためのWebアプリケーション。

### 1.2 主要機能

- **視聴ログ管理**: CD・配信サービス等で聴いた録音の記録。`pieceId` で楽曲マスタを必ず参照する（楽曲名・作曲家名はサーバ側でマスタを結合して表示用 DTO に載せる派生値）
- **視聴ログの検索・統計**: クライアントサイド絞り込みと、件数・評価分布・作曲家ランキング・月別トレンドの集計表示
- **コンサート記録管理**: 会場・指揮者・オーケストラ・ソリスト・プログラム（楽曲マスタ参照）
- **楽曲マスタ管理**: 楽曲の登録・編集・削除（管理者のみ）。詳細ページではログイン中ユーザーの該当楽曲の鑑賞記録一覧（`pieceId` 一致でクライアントサイド絞り込み）を表示し、各鑑賞記録の詳細ページへリンクする
- **楽章表示**: 楽曲（Work）詳細ページに楽章（Movement）の一覧をカード形式で表示し、YouTube 動画は埋め込みプレーヤーで再生する。楽章を直接 `/pieces/{movementId}` で開いた場合は親 Work へのパンくずリンクを表示し、クイックログ生成時は「親 Work title - 楽章 title」で記録する
- **楽章編集**: 楽曲（Work）編集ページ（`/pieces/{id}/edit`）に楽章セクションを追加。`MovementListEditor` コンポーネントで楽章の追加・並び替え（`vuedraggable`）・削除・タイトルと動画 URL の編集を行い、「楽章を保存」ボタンで `PUT /pieces/{workId}/movements` へ一括差し替えする（Work 更新とは独立した送信）
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
| `usePieces`                 | 曲一覧（root の `PieceWork[]`）を取得する。`usePiecesPaginated` / `usePiecesAll` / `usePiece` を提供                                                                          |
| `useMovements`              | 親 Work 配下の楽章一覧を取得する（`GET /pieces/{id}/children`、認証不要）                                                                                                     |
| `useReplaceMovements`       | 親 Work 配下の楽章集合を一括差し替える `replaceMovements(workId, items)` を提供（`PUT /pieces/{workId}/movements`、admin 必須）                                               |
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

// API レスポンス（DTO）。pieceTitle / composerId / composerName はサーバ側で
// Piece / Composer を結合した派生値で、DynamoDB には保存しない。
interface ListeningLog {
  id: string; // UUID (自動生成)
  userId: string | null; // Cognito sub（未帰属データは null）
  listenedAt: string; // 視聴日時 (ISO 8601、UTC、Zサフィックス必須)
  pieceId: string; // 楽曲マスタ（Piece）の id 参照（必須・UUID）
  pieceTitle: string; // 派生: Movement の場合は「親Work title - 楽章 title」
  composerId: string; // 派生: Work の composerId（Movement は親 Work から継承）
  composerName: string; // 派生: Composer.name
  rating: Rating; // 評価 (1〜5の整数)
  isFavorite: boolean;
  memo?: string; // 任意、最大1000文字
  createdAt: string;
  updatedAt: string;
}

// 永続化レコード（派生値を含まない）。リポジトリ層で扱う。
type ListeningLogRecord = Omit<ListeningLog, "pieceTitle" | "composerId" | "composerName">;
```

> `listenedAt` は `datetime-local` 入力値をローカル時刻として `toISOString()` で変換して送信する。

> **`pieceId` 必須化（2026-05）**: 旧スキーマでは `composer` / `piece`（自由記述）と `pieceId`（任意）が併存していたが、楽曲マスタを単一の真実の源にするため `pieceId` を必須化し、自由記述フィールドは削除した。`composer` / `piece` を持つ既存データの自動移行は行わず、運用者（admin）が手動で `pieceId` を埋めるか削除して整える。

> **dangling reference 防止**: `pieceId` の参照先 Piece が削除されると ListeningLog が宙に浮くため、`DELETE /pieces/{id}` は ListeningLog から参照されている場合に 409 Conflict を返す（Work の場合は配下 Movement までまとめて参照チェックする）。

### 3.2 楽曲マスタ (Piece — Composite)

- **テーブル名**: `classical-music-pieces`
- **PK**: `id` (String)
- **GSI**: `parentId-index-index` — PartitionKey=`parentId` (String) / SortKey=`index` (Number) / ProjectionType=ALL。Work 配下の Movement を `index` 昇順で取得するために使用する（`DynamoDBPieceRepository.findChildren` / `removeWorkCascade` / `replaceMovements` から参照）。Work レコードは `parentId` を持たないため当該 GSI には射影されず、Query は Movement のみを返す
- **削除ポリシー**: 全環境 RETAIN

楽曲は `kind` で判別されるコンポジット（Work / Movement）として扱う。Work は親楽曲、Movement は楽章であり、同じ DynamoDB テーブルに格納する（kind 不明な既存データは読み込み時に `kind: "work"` を補完する互換ロジックを `DynamoDBPieceRepository` に持つ）。

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

type PieceKind = "work" | "movement";

interface PieceWork {
  kind: "work";
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

interface PieceMovement {
  kind: "movement";
  id: string;
  parentId: string; // 親 PieceWork の id
  index: number; // 演奏順 (0..999)
  title: string; // 楽章名（最大200文字、空白のみ不可）
  videoUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

type Piece = PieceWork | PieceMovement;
```

> 1 Work あたりの Movement 件数の上限は `MOVEMENTS_PER_WORK_MAX = 49`、`index` の許容範囲は `MOVEMENT_INDEX_MIN..MOVEMENT_INDEX_MAX = 0..999`（`shared/constants.ts`）。49 という値は `PUT /pieces/{workId}/movements` の TransactWriteItems 上限（100 アイテム / 件）に収まるよう、最悪ケース（既存 49 削除 + 新規 49 Put + Work 1 件更新 = 99）から導出している。

> **マイグレーション履歴**:
>
> - 2026-04: `composer`（自由入力）→ `composerId`（参照）。全環境で完了済み（移行 Lambda は撤去）
> - 2026-05: `videoUrl`（単一）→ `videoUrls`（配列）。`DynamoDBPieceRepository` の読み込み時に透過的に正規化されるため、明示的な移行 Lambda は持たない
> - 2026-05: `Piece` を Composite（`PieceWork` / `PieceMovement`）に再設計（PR1）。既存レコードは `kind` を持たないため、`DynamoDBPieceRepository` が読み込み時に `kind: "work"` を補完する。書き込み時は常に `kind` を含める。Movement の永続化と専用エンドポイントは PR2 / PR3 で追加する
> - 2026-05: 楽曲テーブルに `parentId-index-index` GSI を追加（PR2）。`DynamoDBPieceRepository.findChildren` / `removeWorkCascade`（カスケード削除）/ `replaceMovements`（TransactWriteItems による集合置換）を有効化。GSI のバックフィルは AWS 側で非同期に走るため、PR3 デプロイ前に CloudWatch でステータスが `ACTIVE` になっていることを確認すること
> - 2026-05: Movement 用 API（`GET /pieces/{id}/children` / `PUT /pieces/{workId}/movements`）と Work / Movement 横断の単一ノード API（`GET /pieces/{id}` / `PUT /pieces/{id}` / `DELETE /pieces/{id}`）を追加（PR3）。`MOVEMENTS_PER_WORK_MAX` を 64 → 49 に下げて TransactWriteItems の上限内に収める

> **任意項目の更新**: Work では `era` / `genre` / `formation` / `region` を空文字で送信するとフィールドが削除される。`videoUrls` は空配列 `[]` で削除（Work / Movement 共通）。

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
- **リクエストボディ**: `pieceId`（必須・UUID）/ `listenedAt` / `rating` / `isFavorite` / `memo`。`composer` / `piece` / `pieceTitle` / `composerName` は**送らない**
- **レスポンスボディ**: `ListeningLog` DTO。`pieceTitle` / `composerId` / `composerName` はサーバ側で Piece / Composer を結合した派生値で、リクエストには現れない
- **ソート順**: `listenedAt` 降順（新しい順）
- **アクセス制御**: GSI1（`userId` + `createdAt`）でユーザースコープに絞り込み。他ユーザーのアイテムへのアクセスは `404 Not Found`（存在を隠蔽）
- **更新**: 部分更新（Partial Update）。`id` / `createdAt` / `userId` は不変、`updatedAt` は自動更新。`pieceId` は省略可能だが、空文字や `null` は送れない（必須フィールドの解除は許容しない）
- **自動生成**: `id`（UUID v4）/ `userId`（Cognito sub）/ `createdAt` / `updatedAt`
- **ListeningLogDetail（読み取り専用集約）**: ハンドラの戻り値 DTO は `domain/listening-log-detail.ts` の `ListeningLogDetail` で組み立てる。`ListeningLogEntity` 単体は `pieceId` のみを持ち、表示用の派生値は usecase 層で `PieceRepository.findById` / `ComposerRepository.findById` を引いて結合する（一覧 API では同一 pieceId / composerId をまとめて取得し N+1 を抑制）

### 4.4 コンサート記録 API（`/concert-logs`）

- **CRUD**: `GET /concert-logs` / `GET /concert-logs/{id}` / `POST /concert-logs` / `PUT /concert-logs/{id}` / `DELETE /concert-logs/{id}`
- **ソート順**: `concertDate` 降順
- **アクセス制御**: GSI1（`userId` + `createdAt`）でユーザースコープに絞り込み
- **楽観的ロック**: `PUT /concert-logs/{id}` は `updatedAt` を ifMatch 条件にした条件付き Put で更新する。競合時は `409 Conflict` + `{ "message": "Concert log was updated by another request" }`
- 認可・自動生成・更新ルールは視聴ログと同様

### 4.5 楽曲マスタ API（`/pieces`）

楽曲はコンポジット（Work / Movement）として扱う（§3.2）。同じ `/pieces/{id}` でも `kind` により挙動が分岐する。

- **参照**: `GET /pieces`（root の Work のみ）/ `GET /pieces/{id}`（kind 問わず）/ `GET /pieces/{id}/children`（Movement 一覧）。**認証不要**
- **書き込み**: `POST` / `PUT /{id}` / `DELETE /{id}` / `PUT /{workId}/movements`。**`admin` グループ必須**
  - 認証ヘッダーなし: `401 Unauthorized`（API Gateway Authorizer）
  - 認証済みだが非 admin: `403 Forbidden` + `{ "message": "Admin privilege required" }`

#### エンドポイント一覧

| メソッド | パス                         | 認証 | 概要                                                                                                                            |
| -------- | ---------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/pieces`                    | 不要 | Work（root）のカーソル型ページング。Movement は含まれない                                                                       |
| `GET`    | `/pieces/{id}`               | 不要 | kind を問わず単一ノードを取得（Work でも Movement でも返す）                                                                    |
| `GET`    | `/pieces/{id}/children`      | 不要 | 親 Work 配下の Movement を `index` 昇順で返す（`{ items: PieceMovement[] }` ではなく素直な配列）                                |
| `POST`   | `/pieces`                    | 必須 | `kind` に応じて Work / Movement を作成                                                                                          |
| `PUT`    | `/pieces/{id}`               | 必須 | kind 共通の単一更新（kind 不一致は 400）。楽観的ロック付き                                                                      |
| `DELETE` | `/pieces/{id}`               | 必須 | kind を判別。Work なら配下 Movement まで cascade、Movement なら単独削除。ListeningLog から参照されている場合は **409 Conflict** |
| `PUT`    | `/pieces/{workId}/movements` | 必須 | Movement 集合の一括差し替え（並び替え・追加・削除）。Work の楽観的ロック付き                                                    |

#### `GET /pieces` カーソル型ページング

| クエリ   | 既定 | 制約                                     |
| -------- | ---- | ---------------------------------------- |
| `limit`  | 50   | 1〜100、範囲外は `400 Bad Request`       |
| `cursor` | なし | 前回 `nextCursor` を渡す。不正値は `400` |

レスポンス: `{ "items": PieceWork[], "nextCursor": "opaque-base64url" | null }`。`nextCursor` 無しで終端。Work のみが返される（Movement は `parentId-index-index` GSI に射影されるが、ベーステーブルの Scan 結果から `kind === "movement"` を除外している）。

**カーソル仕様**: `base64url(JSON.stringify({ v: 1, k: LastEvaluatedKey }))` の不透明文字列。形式は Zod の `z.base64url()` で検証、デコード後の不正・未知バージョンは `decodeCursor` で検出して 400。**HMAC は付与しない**（楽曲マスタは全ユーザ共通でテナント境界を越えるリスク無し）。

**ソート順**: DynamoDB Scan の戻り順（順不同）。

#### `GET /pieces/{id}/children`

親 Work 配下の Movement を `index` 昇順で全件返す。`parentId-index-index` GSI を利用。

- レスポンス: `PieceMovement[]`（直接配列、`composerId` は含まれない）
- 親 Work が存在しない `id` を渡しても 200 + 空配列を返す（GSI Query は親の存在を要求しない）

#### `PUT /pieces/{workId}/movements`

親 Work 配下の Movement 集合を一括差し替えする。並び替え・追加・削除を 1 つの DynamoDB TransactWriteItems で原子的に反映する。

- **リクエストボディ**: `{ "movements": [{ "id"?, "index", "title", "videoUrls"? }, ...] }`
  - `id` を指定すると既存 Movement の更新（`createdAt` を引き継ぐ）。省略時は新規 UUID を採番
  - `index` は 0〜999 の整数。**同じ Work 内で重複は 400 Bad Request**（`replaceMovementsSchema.refine`）
  - `title` は 1〜200 文字
  - `videoUrls` は最大 10 件、URL 形式
- **件数上限**: `MOVEMENTS_PER_WORK_MAX = 49` 件（既存 49 削除 + 新規 49 Put + Work 1 件更新 = 99 で TransactWriteItems の上限 100 以下）
- **楽観的ロック**: Work の `updatedAt` を ifMatch 条件にして同一トランザクションで Work の `updatedAt` を進める。競合時は `409 Conflict` + `{ "message": "Piece was updated by another request" }`
- **Work が存在しない場合**: `404 Not Found`
- **レスポンス**: `{ "movements": PieceMovement[] }` 200 OK

#### Movement のレスポンスポリシー

- Movement の API レスポンスには `composerId` を含めない（親 Work から継承するため）
- フロント側で楽章の作曲家を表示する場合は、親 Work を別途 fetch する（`GET /pieces/{parentId}`）

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
- **関数数**: 28 個（本スタック。データ移行用 Lambda は `MigrationsStack` に分離）
  - 視聴ログ × 5 / 楽曲マスタ × 7（CRUD 5 + `getPieceChildren` + `replacePieceMovements`）/ 作曲家マスタ × 5 / コンサート記録 × 5 / 認証系 × 5（register・login・verify-email・resend-verification-code・refresh）/ PreSignUp トリガー × 1
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
- 派生クラスの規約: `private constructor(props)` で `super(props)` を呼ぶ。`static create()` / `static reconstruct()` ファクトリは個別実装。`toPlain()` / `isOwnedBy()` は派生クラスで実装
- 更新方法は派生クラスごとに 3 系統:
  - **集約意図メソッド系**（`ConcertLogEntity`）: 鑑賞記録のドメイン操作は「過去に観測した事実の記録を訂正・追記する」という単一の意図に帰着する（コンサート運営者ではなく鑑賞者の語彙）。そのためフィールド単位の意図メソッドは生やさず、`revise(revision: ConcertLogRevision)` 1 メソッドに集約する。実装は内部で `entity-helpers.ts:buildUpdateProps` を呼ぶ
  - **個別意図メソッド系**（`ListeningLogEntity`）: フィールドごとに鑑賞者ドメインの意図がはっきり違うため、`markAsFavorite()` / `unmarkAsFavorite()` / `rerate(rating)` / `rewriteMemo(memo)` / `correctListenedAt(listenedAt)` / `relinkPiece(pieceId)` を個別に生やす。汎用 `mergeUpdate` は持たない。usecase の `update` は `Update*Input` を受け取って意図メソッドへ dispatch する（`applyRevisions` ヘルパー）
  - **`mergeUpdate(input)` 系**（`ComposerEntity` / `PieceWorkEntity` / `PieceMovementEntity`）: `entity-helpers.ts:buildUpdateProps` を介して `Update*Input` をシャローマージする汎用更新メソッド。命名がドメイン語彙を反映していない貧血状態。意図メソッド化（`recordLifeSpan` 等）への移行は段階的に進める

### 8.4 読み取り専用集約（ListeningLogDetail）

`backend/src/domain/listening-log-detail.ts` の `ListeningLogDetail` は、`ListeningLogEntity` と関連する `Piece`（Work / Movement）・`Composer` を保持し、表示用 DTO（`ListeningLog`）を組み立てる読み取り専用集約。

- `ListeningLogEntity` は `pieceId` のみを保持し、楽曲名・作曲家名は持たない（DDD の集約境界に従い、関連集約は ID で参照）
- 派生値の解決責任は `ListeningLogDetail` に閉じる:
  - `pieceTitle`: Work なら `piece.title`、Movement なら「親 Work title - 楽章 title」に整形
  - `composerId` / `composerName`: Work なら自身の `composerId`、Movement なら親 Work から継承
- ドメイン層は `repositories/` に依存しないため、必要な `Piece` / `Composer` は usecase 層が事前に取得して `ListeningLogDetail.from(log, piece, parentWork, composer)` に渡す
- 一覧 API では同一 `pieceId` / 同一 `composerId` の重複取得を排除し、N+1 を抑制する（`ListeningLogUsecase.toDetailDtoList`）

### 8.5 その他の値オブジェクト（バックエンドのみ）

ID 以外のドメイン概念も不変条件を VO で保証する。すべて `backend/src/domain/value-objects/` 配下。

| クラス          | 不変条件                                    | 利用箇所                                                          |
| --------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| `Rating`        | 1〜5 の整数                                 | `ListeningLogEntity.props.rating`                                 |
| `PieceTitle`    | 非空・最大 200 文字                         | `PieceWorkEntity.props.title` / `PieceMovementEntity.props.title` |
| `MovementIndex` | 0〜999 の整数                               | `PieceMovementEntity.props.index`                                 |
| `ComposerName`  | 非空・最大 100 文字                         | `ComposerEntity.props.name`                                       |
| `ConcertTitle`  | 非空・最大 200 文字                         | `ConcertLogEntity.props.title`                                    |
| `Venue`         | 非空・最大 200 文字                         | `ConcertLogEntity.props.venue`                                    |
| `Url`           | WHATWG URL パーサーで形式検証               | `Piece.videoUrls` 各要素 / `Composer.imageUrl`                    |
| `Year`          | -3000〜9999 の整数（西暦。BC は負数で表現） | `ComposerEntity.props.birthYear` / `props.deathYear`              |

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
