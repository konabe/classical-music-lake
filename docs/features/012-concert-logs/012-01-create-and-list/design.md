# ワーク012-01 設計書: コンサート記録の作成・一覧

## 1. 全体方針

既存の `listening-logs` 機能と極めて類似した構造を持つ。**listening-logs のパターンを踏襲し、差分にのみ意思決定を集中させる**方針とする。

---

## 2. データモデル

### DynamoDB テーブル

| 項目                  | 値                                         |
| --------------------- | ------------------------------------------ |
| テーブル名（prod）    | `classical-music-concert-logs`             |
| テーブル名（stg/dev） | `classical-music-concert-logs-{stageName}` |
| パーティションキー    | `id` (STRING)                              |
| 課金モード            | PAY_PER_REQUEST                            |
| PITR                  | 有効                                       |
| RemovalPolicy         | prod=RETAIN / stg・dev=DESTROY             |

#### GSI

| 項目               | 値                   |
| ------------------ | -------------------- |
| インデックス名     | GSI1                 |
| パーティションキー | `userId` (STRING)    |
| ソートキー         | `createdAt` (STRING) |
| プロジェクション   | ALL                  |

**GSIソートキーに `createdAt` を採用する理由**:
`queryItemsByUserId` ユーティリティ関数が `GSI1 / userId + createdAt` を前提としているため再利用できる。表示順のソート（`concertDate` 降順）はアプリ層で実施する（listening-logs と同一パターン）。

### データ構造

| フィールド    | 型     | 必須 | 説明                                      |
| ------------- | ------ | ---- | ----------------------------------------- |
| `id`          | string | ✅   | UUID（自動生成）                          |
| `userId`      | string | ✅   | Cognito sub（認証必須のため `null` なし） |
| `concertDate` | string | ✅   | 開催日時（ISO 8601形式）                  |
| `venue`       | string | ✅   | 会場名                                    |
| `conductor`   | string | -    | 指揮者名（任意）                          |
| `orchestra`   | string | -    | オーケストラ・アンサンブル名（任意）      |
| `soloist`     | string | -    | ソリスト名（任意）                        |
| `createdAt`   | string | ✅   | 作成日時（ISO 8601形式、自動生成）        |
| `updatedAt`   | string | ✅   | 更新日時（ISO 8601形式、自動生成）        |

`userId` は `string | null` でなく `string` にする（コンサート記録は認証必須で作成されるため未帰属データが発生しない）。

---

## 3. 型定義の配置

`shared/constants.ts` への追加は不要（列挙型の選択肢がないため）。

フロント・バック各 `types/index.ts` に**同一内容を重複して追加**する（CLAUDE.md の方針に従う）。

| 型名                    | 追加先                                              | 説明                                                          |
| ----------------------- | --------------------------------------------------- | ------------------------------------------------------------- |
| `ConcertLog`            | `app/types/index.ts` / `backend/src/types/index.ts` | コンサート記録エンティティ                                    |
| `CreateConcertLogInput` | 同上                                                | 作成入力型（`id`, `userId`, `createdAt`, `updatedAt` を除く） |

---

## 4. バリデーション仕様

`backend/src/utils/schemas.ts` に `createConcertLogSchema` を追加する。

| フィールド    | バリデーション                      | 理由                                            |
| ------------- | ----------------------------------- | ----------------------------------------------- |
| `concertDate` | `z.iso.datetime({ offset: false })` | `listenedAt` と同一方式で統一                   |
| `venue`       | `trim().min(1).max(200)`            | 空白のみ禁止、最大200文字（piece と同等の上限） |
| `conductor`   | `trim().max(100).optional()`        | 最大100文字（composer と同等の上限）            |
| `orchestra`   | `trim().max(100).optional()`        | 同上                                            |
| `soloist`     | `trim().max(100).optional()`        | 同上                                            |

任意フィールドは値が空文字列の場合、フロントエンド側で `undefined` に変換して送信する（DynamoDB の `removeUndefinedValues: true` を活用し、フィールド未設定を明確化）。

---

## 5. APIエンドポイント

| メソッド | パス            | 認証                       | 説明                            |
| -------- | --------------- | -------------------------- | ------------------------------- |
| POST     | `/concert-logs` | Cognito Authorizer（必須） | 新規作成 → 201 Created          |
| GET      | `/concert-logs` | Cognito Authorizer（必須） | ログインユーザーの一覧 → 200 OK |

`pieces` と異なりパブリックアクセス不要のため、全エンドポイントに認証を付ける。

---

## 6. バックエンド構成

### ディレクトリ構成

```text
backend/src/concert-logs/
  create.ts
  list.ts
  create.test.ts
  list.test.ts
```

get / update / delete は将来ワーク（012-02以降）で実装するためスコープ外。

### Lambda 実装方針

**create.ts**:

- `parseRequestBody` + `createConcertLogSchema` でバリデーション
- `randomUUID()` で ID 生成
- `getUserId(event)` で userId 取得
- `PutCommand` で DynamoDB に書き込み
- `StatusCodes.CREATED (201)` を返す

**list.ts**:

- `getUserId(event)` で userId 取得
- `queryItemsByUserId<ConcertLog>(TABLE_CONCERT_LOGS, userId)` で一覧取得
- `concertDate` 降順でソート
- `StatusCodes.OK (200)` を返す

### 環境変数

`backend/src/utils/env.ts` の `AppEnv` クラスに `dynamoTableConcertLogs` を追加する。

---

## 7. CDK インフラ設計

`cdk/lib/classical-music-lake-stack.ts` に以下を追加する。

1. **DynamoDB テーブル** — `concertLogsTable`（上記テーブル定義）
2. **Lambda 関数** — `ConcertLogsCreate`, `ConcertLogsList`
3. **環境変数付与** — `DYNAMO_TABLE_CONCERT_LOGS` を各関数に付与
4. **DynamoDB 権限** — Create に WriteData、List に ReadData を付与
5. **API Gateway リソース** — `/concert-logs` を追加し GET/POST を定義
6. **CORS** — GET/POST/OPTIONS に `Content-Type`, `Authorization` ヘッダーを許可
7. **CloudWatch アラーム** — `allFunctions` 配列に追加し既存のアラームループに含める

---

## 8. フロントエンド設計

### ページ構成

| ページ   | パス                      | 認証                  |
| -------- | ------------------------- | --------------------- |
| 一覧     | `/concert-logs/index.vue` | auth ミドルウェア必須 |
| 新規作成 | `/concert-logs/new.vue`   | auth ミドルウェア必須 |

### Composable

`app/composables/useConcertLogs.ts` を新設する。

`getAuthHeaders()` / `handleAuthError()` 等の共通処理は今回は `useListeningLogs.ts` から複製して使用する（共通ユーティリティへの切り出しは独立したリファクタリングワークに分離する）。

### コンポーネント構成（Atomic Design）

| 層        | コンポーネント名            | 役割                     |
| --------- | --------------------------- | ------------------------ |
| Organisms | `ConcertLogForm.vue`        | 新規作成フォーム         |
| Molecules | `ConcertLogItem.vue`        | 一覧の各行               |
| Organisms | `ConcertLogList.vue`        | 一覧コンテナ             |
| Templates | `ConcertLogsTemplate.vue`   | 一覧ページレイアウト     |
| Templates | `ConcertLogNewTemplate.vue` | 新規作成ページレイアウト |

### フォーム実装方針

- 送信時に `new Date(form.concertDate).toISOString()` で UTC 変換（`ListeningLogForm` と同一）
- 任意フィールドが空文字列の場合はプロパティを `undefined` に変換して送信

### トップページ導線

`app/pages/index.vue` （または `HomeTemplate.vue`）の管理者向けリンクセクションに「コンサート記録」への導線を追加する。

---

## 9. 実装順序

1. 型定義の追加（`app/types/index.ts`, `backend/src/types/index.ts`）
2. バックエンド基盤（`env.ts`, `schemas.ts`）
3. Lambda 関数（`create.ts`, `list.ts`）とユニットテスト
4. CDK インフラ定義
5. Composable（`useConcertLogs.ts`）とユニットテスト
6. コンポーネント（Molecules → Organisms → Templates）
7. ページ（`index.vue`, `new.vue`）
8. トップページ導線追加

---

## 10. 設計判断まとめ

| 決定事項                        | 採用方針                                       | 主な理由                                                      |
| ------------------------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| GSI ソートキー                  | `createdAt`                                    | `queryItemsByUserId` を再利用可能。表示ソートはアプリ層で実施 |
| 型定義の配置                    | フロント・バック各 `types/index.ts` に重複追加 | CLAUDE.md の方針に従う                                        |
| `shared/constants.ts` への追加  | 追加しない                                     | 列挙型の選択肢がないため対象外                                |
| `userId` の型                   | `string`（nullなし）                           | 認証必須のため未帰属データが発生しない                        |
| 認証                            | 全エンドポイントに Cognito Authorizer          | 要件通り。パブリックアクセス不要                              |
| 任意フィールドの空文字扱い      | 送信時に `undefined` へ変換                    | DynamoDB の `removeUndefinedValues: true` を活用              |
| 共通処理（`getAuthHeaders` 等） | 今回は複製                                     | 共通化は独立リファクタリングワークへ分離                      |
| バリデーション文字数上限        | `venue` 200文字、任意フィールド 100 文字       | 既存の `piece`/`composer` の上限に合わせて一貫性を保つ        |

---

## レビュー結果

<!-- レビュー後に記入してください -->

| 項目               | 結果 | コメント |
| ------------------ | ---- | -------- |
| DynamoDB設計       | ok   |          |
| 型定義方針         | ok   |          |
| APIエンドポイント  | ok   |          |
| フロントエンド構成 | 0k   |          |
| その他             | ok   |          |
