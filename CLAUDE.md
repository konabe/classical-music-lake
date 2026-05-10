# Claude Code ガイドライン

> このプロジェクトでは **Claude Code**（Anthropic 製 CLI）を AI エージェントとして使用しています。

## 基本ルール

- 日本語で応答すること
- 実装を含むPRを作成・更新したら、同じPR内で `docs/SPEC.md` に反映すること
- DDD（ドメイン駆動設計）の設計思想を採用すること。バックエンドのレイヤー構成と依存方向は ESLint で機械的に強制している（詳細は後述）
- `cd` を先頭に付けてコマンドを生成しないこと
- Bash ツールでコマンドを実行する際、`&&` で連結せず1コマンドずつ実行すること

---

## プロジェクトの目的・背景

クラシック音楽の鑑賞体験を記録・管理するWebアプリ「Classical Music Lake」。
CD・配信で聴いた演奏を記録し、作曲家・曲名・演奏家・指揮者・評価・メモを管理する個人向けサービス。

### 実装済みの主な機能（2026-05 時点）

- 視聴ログ CRUD（`/listening-logs`）
- 視聴ログのクライアントサイド検索フィルタ（`useListeningLogFilter`）と統計ダッシュボード（`useListeningLogStatistics`）
- コンサート記録 CRUD（`/concert-logs`、楽曲マスタとの紐付け対応）
- 楽曲マスタ CRUD（`/pieces`、参照は公開／書き込みは admin のみ）
- 作曲家マスタ CRUD（`/composers`、参照は公開／書き込みは admin のみ）
- ユーザー認証（Cognito）：メール+パスワード／メール確認／Google OAuth（Hosted UI）／リフレッシュトークン
- `admin` Cognito グループによるロールベース認可（API + フロントの UI ガード）
- ライト/ダークテーマ切替（`@nuxtjs/color-mode`）
- グローバルヘッダー / 認証用レイアウト

### 将来フェーズの主な未実装

- サーバーサイドの全文検索（OpenSearch 等）
- サーバーサイド集計（現状はクライアント集計）
- 視聴ログ・コンサート記録のページネーション（楽曲マスタはカーソル型実装済み）
- MFA・Apple Sign-In
- 画像アップロード

---

## 重要なファイルの説明

| ファイル/ディレクトリ                   | 役割                                                                          |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| @docs/SPEC.md                           | システム仕様書。API仕様・データモデル・インフラ構成・ドメイン設計             |
| @docs/ARCHITECTURE.md                   | アーキテクチャ設計書。構成図・データフロー・技術選定の理由・トレードオフ      |
| @docs/INCEPTION_DECK.md                 | プロジェクトのビジョン・スコープ・フェーズ計画                                |
| @CONTRIBUTING.md                        | ブランチ戦略・PR ルール（`main` 直 push 禁止、命名規則）                      |
| `app/pages/`                            | Nuxt ページ（ルーティング）                                                   |
| `app/components/`                       | UI コンポーネント。Atomic Design（atoms / molecules / organisms / templates） |
| `app/composables/`                      | Vue Composables（API呼び出し・認証など共通ロジック）                          |
| `app/layouts/`                          | レイアウト（`default` / `auth`）                                              |
| `app/middleware/`                       | ルートミドルウェア（`auth.ts` / `admin.ts`）                                  |
| `app/utils/video.ts`                    | YouTube URL 判定・ID 抽出・埋め込み URL 変換                                  |
| `app/assets/css/theme.css`              | ライト/ダークの CSS 変数定義（`@nuxtjs/color-mode` 連動）                     |
| `app/types/index.ts`                    | フロントエンド共通型（`shared/` から re-export）                              |
| `shared/constants.ts`                   | フロント・バックエンド共通の定数・型（カテゴリ enum 等）                      |
| `backend/src/handlers/`                 | Lambda エントリポイント（API Gateway イベント受け）                           |
| `backend/src/usecases/`                 | アプリケーション層（ハンドラと値オブジェクトの再 export 含む）                |
| `backend/src/domain/`                   | ドメイン層（エンティティ・値オブジェクト・リポジトリインターフェース）        |
| `backend/src/domain/value-objects/`     | 値オブジェクト（`ids.ts` / `rating.ts` / `piece-title.ts` 等）                |
| `backend/src/repositories/`             | DynamoDB / Cognito の実装                                                     |
| `backend/src/utils/schemas.ts`          | Zod バリデーションスキーマ                                                    |
| `backend/src/utils/auth.ts`             | `admin` グループ判定（`requireAdmin`）                                        |
| `backend/src/utils/response.ts`         | API レスポンスヘルパー                                                        |
| `backend/src/utils/dynamodb.ts`         | DynamoDB クライアントのラッパー                                               |
| `backend/src/types/`                    | バックエンド共通型（`shared/` から re-export）                                |
| `backend/src/migrations/`               | 一時的なデータ移行 Lambda（本番スタックから分離）                             |
| `cdk/lib/classical-music-lake-stack.ts` | 本番ランタイムの AWS インフラ定義（Lambda / API Gateway / DynamoDB 等）       |
| `cdk/lib/dns-stack.ts`                  | Route53 + ACM 証明書（us-east-1、全環境共有）                                 |
| `cdk/lib/migrations-stack.ts`           | 移行 Lambda 専用スタック                                                      |
| `tests/e2e/`                            | E2E テスト（Vitest + Playwright MCP）                                         |

---

## バックエンドのレイヤー構成（DDD）

`backend/src/` は以下の4層で構成され、依存方向は ESLint（`eslint.config.mjs` の `no-restricted-imports`）で強制している。

```text
handlers → usecases → domain
                   ↘ repositories → domain
```

| 層              | 役割                                                            | 依存できる層                      |
| --------------- | --------------------------------------------------------------- | --------------------------------- |
| `handlers/`     | Lambda エントリ。リクエスト解析・認証情報取得・usecase 呼び出し | `usecases`、`utils`               |
| `usecases/`     | アプリケーション層。ドメインオブジェクトとリポジトリの調停      | `domain`、`repositories`、`utils` |
| `domain/`       | エンティティ・値オブジェクト・リポジトリ I/F。**純粋関数層**    | 同層内のみ（utils も禁止）        |
| `repositories/` | ドメイン I/F の DynamoDB / Cognito 実装                         | `domain`、`utils`                 |

### 守るべきポイント

- `handlers/` から `domain/` を直接 import しない（usecase の re-export 経由で値オブジェクトを受け取る）
- `domain/` は `utils/` `repositories/` `handlers/` `usecases/` のいずれにも依存禁止（純粋関数層）
- ID は値オブジェクト（`PieceId` `ComposerId` `ListeningLogId` `ConcertLogId` `UserId`）として受け渡し、文字列での取り違えを型で防ぐ
- テキスト/数値の不変条件は値オブジェクト（`Rating` `PieceTitle` `ComposerName` `Venue` `Url`）でドメイン側に閉じる
- エンティティは共通基底 `Entity<TId, TProps>` を継承する

> 詳細は `docs/SPEC.md` 8章「型定義管理方針」を参照。

---

## コーディング規約

命名規則・フォーマット・インポート順序は ESLint（@eslint.config.mjs）と Prettier（@.prettierrc）、CSS は Stylelint（@stylelint.config.mjs）で自動的に強制される。

### 共通

- **言語**: TypeScript（フロント・バック共通）
- **型定義**: `any` 禁止（ESLint で error）
- **コメント**: 自明なロジックへのコメント不要。複雑な処理のみ記述
- **テストファイル配置**: 実装ファイルと同じディレクトリに `*.test.ts` で併置する（例: `auth.ts` と `auth.test.ts`）

### フロントエンド（Nuxt 3 / Vue 3）

- Composition API（`<script setup>`）を使用
- ディレクトリは `app/` 配下（Nuxt 4 の `srcDir: "app/"` 構成）
- API 呼び出しロジックは `app/composables/` にまとめる
- コンポーネントは Atomic Design に従って `atoms` → `molecules` → `organisms` → `templates` の順で構築する
- 認証情報は `useAuth` 経由で読み書きする（`localStorage` への直接アクセス禁止）
- 401 を受けた API 呼び出しは composable 内で `refreshTokens()` を試行してから再要求する既存パターンを踏襲する
- 管理者向け UI は `useAuth().isAdmin()` で表示制御し、保護対象ページは `middleware/admin.ts` で TOP にリダイレクトする（セキュリティ境界はサーバ側 403 で担保）

### バックエンド（Lambda）

- 機能ごとに `handlers/{機能名}/{操作}.ts` を1ファイル1エンドポイントで作成
- レスポンスは `utils/response.ts` のヘルパーを使用
- エラーは必ず `try/catch` で捕捉し `internalError()` を返す
- バリデーションは `utils/schemas.ts` の Zod スキーマで行い、`parseRequestBody` を経由する
- 認可が必要なハンドラは冒頭で `requireAdmin(event)` を呼ぶ

### TypeScript

- strict モードを前提とした型付け
- `interface` より `type` を優先（ただし拡張が必要な場合は `interface`）

---

## コミットメッセージ規約

このプロジェクトは [Conventional Commits](https://www.conventionalcommits.org/) を採用しており、`commitlint`（`@commitlint/config-conventional`）と husky の `commit-msg` フックで自動検証される。さらに pre-commit フックで `lint-staged` が走り、ESLint / Stylelint / Prettier が自動修正される。

### フォーマット

```text
type(scope): 日本語の説明
```

- `scope` は省略可能
- 説明（subject）は日本語で記述する
- subject の先頭を英大文字にしない（`subject-case` ルール）。英単語・ファイル名・クラス名（`PieceTitle` のような PascalCase）を先頭に置きたい場合は日本語から始める形に言い換える
- このルールは **PR タイトル** にも同じく適用される（PR タイトル＝マージ後の commit message になるため）。クラス名や型名を頭に置く形式（例: `refactor(backend): ConcertTitle 値オブジェクトを導入`）は `subject must not be ... pascal-case` で弾かれるので避ける
- 末尾にピリオド（`.`・`。`）を付けない
- ヘッダー全体は100文字以内

### 例

```text
✅ feat: 視聴ログ統計ダッシュボードを追加
✅ fix(auth): リフレッシュトークン失効時のリダイレクトを修正
✅ docs: SPEC.md にコンサート記録 API を追記
✅ refactor(backend): 楽曲の title を PieceTitle 値オブジェクト化

❌ Add stats dashboard                          （subject-case 違反 + 英語）
❌ feat: Update README.md                        （subject の先頭が英大文字）
❌ refactor(backend): PieceTitle 値オブジェクトを導入  （subject 先頭が PascalCase で弾かれる）
❌ feat: 視聴ログ統計を追加。                       （末尾の句点）
```

---

## テスト・品質チェックコマンド

| 対象                            | コマンド                                            |
| ------------------------------- | --------------------------------------------------- |
| バックエンドのみ                | `pnpm run test:backend`（= `pnpm -C backend test`） |
| フロントエンドのみ              | `pnpm run test:frontend`                            |
| E2E                             | `pnpm run test:e2e`                                 |
| 全体 Lint（ESLint + Stylelint） | `pnpm run lint` / `pnpm run lint:fix`               |
| Prettier                        | `pnpm run format` / `pnpm run format:check`         |
| Storybook                       | `pnpm run storybook` / `pnpm run build-storybook`   |
| Mutation testing（フロント）    | `pnpm run stryker`                                  |
| Mutation testing（バック）      | `pnpm run stryker:backend`                          |

> **注意**: `pnpm test` はバックエンドのみ実行される。両方テストしたい場合は `pnpm run test:backend` と `pnpm run test:frontend` を個別に実行すること。

---

## よくある操作パターン

### フロントエンドのAPI呼び出し

`app/composables/` に API 呼び出しロジックをまとめ、ページからは composable 経由で利用する。401 リトライ・認証ヘッダー付与は composable 内に閉じ込める。

### バックエンドの Lambda 関数追加（DDD レイヤード）

1. **ドメイン**: `backend/src/domain/` にエンティティ・値オブジェクト・リポジトリ I/F を追加・拡張
2. **リポジトリ実装**: `backend/src/repositories/` で DynamoDB アクセスを実装
3. **ユースケース**: `backend/src/usecases/{機能名}-usecase.ts` にビジネスロジックを実装。ハンドラに公開する値オブジェクトはここから re-export
4. **ハンドラ**: `backend/src/handlers/{機能名}/{操作}.ts` を1ファイル1エンドポイントで作成
5. **バリデーション**: `backend/src/utils/schemas.ts` に Zod スキーマを追加
6. **テスト**: 各層に `*.test.ts` を併置（実装と同じディレクトリ）
7. **インフラ**: `cdk/lib/classical-music-lake-stack.ts` に Lambda 関数・API Gateway ルート・IAM 権限を追加
8. **仕様書**: `docs/SPEC.md` に API 仕様（エンドポイント・リクエスト/レスポンス・バリデーション）を追記

### 新しい型の追加

- フロントエンドの型: `app/types/index.ts`
- バックエンドの型: `backend/src/types/index.ts`
- フロント・バックエンド共通の定数・型: `shared/constants.ts` に定義し、各パッケージの型定義ファイルから re-export する
- 上記以外で両方に同じ型が必要な場合は重複を許容（パッケージを分離しているため）

---

## サブエージェントの活用方針

コンテキストを分離することで品質・生産性を向上させる目的で、以下の方針でサブエージェントを活用する。

### 使用するタイミング

| ユースケース                         | 使用するエージェント           |
| ------------------------------------ | ------------------------------ |
| コードベースの広範な調査・探索       | `Explore` エージェント         |
| 実装戦略の設計・計画立案             | `Plan` エージェント            |
| 複雑なマルチステップタスクの自動実行 | `general-purpose` エージェント |

### 基本方針

- **並列実行より文脈分離を優先**: 独立したタスクを並列化するだけでなく、メインのコンテキストウィンドウを汚染しないためにサブエージェントを使う
- **調査と実装の分離**: コードベース調査（Explore）と実装（メインエージェント）を分けることで、調査結果のノイズを排除する
- **広範な検索はサブエージェントに委譲**: 3回以上のGlob/Grepが必要になりそうな探索は `Explore` エージェントに任せる
- **設計フェーズでの活用**: 複雑な機能追加の前に `Plan` エージェントでアーキテクチャを検討する

---

## 推奨MCPサーバー

| サーバー                | 用途                             |
| ----------------------- | -------------------------------- |
| `@playwright/mcp`       | E2Eテスト・ブラウザ操作に使用    |
| `@upstash/context7-mcp` | ライブラリドキュメント参照に使用 |

---

## 禁止事項・注意事項

- ブランチ戦略・PR ルールは `CONTRIBUTING.md` に従う（`main` への直接 push 禁止・必ず PR を作成）
- `any` 型の使用禁止
- 認証なしの API を新規追加しないこと。マスタの参照系（`GET /pieces` `GET /composers`）以外はすべて Cognito Authorizer で保護する
- 個人情報（視聴ログ・コンサート記録）を扱う API は GSI1（`userId`）で必ずユーザースコープに絞り込むこと
- DynamoDB の削除ポリシーを変更しないこと:
  - `ListeningLogs` / `Pieces` / `Composers`: 全環境 RETAIN
  - `ConcertLogs`: prod は RETAIN、stg/dev は DESTROY
- 環境変数（`.env`）をコミットしないこと
- バックエンドのレイヤー依存方向（handlers → usecases → domain / repositories）に違反しないこと（ESLint で error）
