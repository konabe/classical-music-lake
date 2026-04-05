# ワーク012-02 設計書: コンサート記録の詳細・編集・削除

## 1. 全体方針

既存の `listening-logs` の get/update/delete パターンを踏襲する。**012-01 で確立したコンサート記録の基盤（テーブル・型・スキーマ）を前提とし、差分にのみ意思決定を集中させる**方針とする。

---

## 2. 型定義の追加

`UpdateConcertLogInput` 型をフロント・バック各 `types/index.ts` に追加する（CLAUDE.md の方針に従い重複定義）。

| 型名                    | 追加先                                              | 説明                                                             |
| ----------------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| `UpdateConcertLogInput` | `app/types/index.ts` / `backend/src/types/index.ts` | コンサート記録更新入力型（全フィールド optional の部分更新形式） |

---

## 3. バリデーション仕様

`backend/src/utils/schemas.ts` に `updateConcertLogSchema` を追加する。

```ts
updateConcertLogSchema = createConcertLogSchema.partial();
```

`updateListeningLogSchema` と同一パターン。全フィールドを optional にすることで部分更新を実現する。

---

## 4. APIエンドポイント

| メソッド | パス                 | 認証                       | 説明                                  |
| -------- | -------------------- | -------------------------- | ------------------------------------- |
| GET      | `/concert-logs/{id}` | Cognito Authorizer（必須） | コンサート記録の詳細取得 → 200 OK     |
| PUT      | `/concert-logs/{id}` | Cognito Authorizer（必須） | コンサート記録の更新 → 200 OK         |
| DELETE   | `/concert-logs/{id}` | Cognito Authorizer（必須） | コンサート記録の削除 → 204 No Content |

アクセス制御: 他ユーザーのリソースには 404 を返す（存在を隠蔽）。

---

## 5. バックエンド構成

### ディレクトリ構成

```text
backend/src/concert-logs/
  get.ts          (新規)
  update.ts       (新規)
  delete.ts       (新規)
  get.test.ts     (新規)
  update.test.ts  (新規)
  delete.test.ts  (新規)
```

### Lambda 実装方針

**get.ts**:

- `getIdParam(event)` で ID 取得
- `getUserId(event)` で userId 取得
- `GetCommand` で DynamoDB からアイテム取得
- `item === undefined || item.userId !== userId` の場合は 404 をスロー
- 成功時: 200 + item を返す

**update.ts**:

- `parseRequestBody` + `updateConcertLogSchema` でバリデーション
- `getIdParam(event)` / `getUserId(event)` で ID・userId 取得
- 既存アイテム取得 → userId 確認（get と同じ）
- `updateItem<ConcertLog>(TABLE_CONCERT_LOGS, id, input)` で更新
  - 楽観的ロック（`ConditionExpression: "updatedAt = :prevUpdatedAt"`）により同時編集を検出
  - 409 コンフリクト時はエラースロー
- 成功時: 200 + 更新済みアイテムを返す

**delete.ts**:

- `getIdParam(event)` / `getUserId(event)` で ID・userId 取得
- 既存アイテム取得 → userId 確認（get と同じ）
- `DeleteCommand` でアイテムを削除
- 成功時: 204 No Content を返す

---

## 6. CDK インフラ設計

`cdk/lib/classical-music-lake-stack.ts` に以下を追加する。

1. **Lambda 関数** — `ConcertLogsGet`, `ConcertLogsUpdate`, `ConcertLogsDelete`
2. **DynamoDB 権限**
   - `ConcertLogsGet`: `grantReadData`
   - `ConcertLogsUpdate`: `grantReadWriteData`
   - `ConcertLogsDelete`: `grantWriteData`（既存アイテム確認のため ReadData も必要。`grantReadWriteData` を付与）
3. **API Gateway リソース** — `/concert-logs/{id}` を追加し GET/PUT/DELETE/OPTIONS を定義
4. **CORS** — OPTIONS に `Content-Type`, `Authorization` ヘッダーを許可
5. **CloudWatch アラーム** — `allFunctions` 配列に3関数を追加

> Delete Lambda は既存アイテムの userId 確認のため GetItem も必要なので `grantReadWriteData` を付与する（`listening-logs/delete.ts` の既存パターンと同様）。

---

## 7. フロントエンド設計

### ページ構成

| ページ | パス                           | 認証                  |
| ------ | ------------------------------ | --------------------- |
| 詳細   | `/concert-logs/[id]/index.vue` | auth ミドルウェア必須 |
| 編集   | `/concert-logs/[id]/edit.vue`  | auth ミドルウェア必須 |

### Composable 拡張

`app/composables/useConcertLogs.ts` に以下を追加する。

| 追加内容                     | 説明                                                  |
| ---------------------------- | ----------------------------------------------------- |
| `get(id)` メソッド           | GET `/concert-logs/{id}` → `ConcertLog` 返却          |
| `update(id, input)` メソッド | PUT `/concert-logs/{id}` → 更新済み `ConcertLog` 返却 |
| `deleteLog(id)` メソッド     | DELETE `/concert-logs/{id}` → void                    |

`useConcertLog(id: () => string)` を新設する。

- `useListeningLog` と同一パターン
- `useFetch<ConcertLog>` で GET `/concert-logs/{id()}` を自動実行
- 401 エラー時の自動リトライ（`handleAuthError` + `result.refresh()`）

### コンポーネント構成（Atomic Design）

| 層        | コンポーネント名               | 役割                                                           |
| --------- | ------------------------------ | -------------------------------------------------------------- |
| Organisms | `ConcertLogDetail.vue`         | コンサート記録の詳細表示（全フィールド読み取り専用）           |
| Templates | `ConcertLogDetailTemplate.vue` | 詳細ページレイアウト（Detail + 編集・削除ボタン）              |
| Templates | `ConcertLogEditTemplate.vue`   | 編集ページレイアウト（ConcertLogForm に initialValues を渡す） |

既存 `ConcertLogForm.vue` は `initialValues?: Partial<CreateConcertLogInput>` props を追加して編集にも対応させる（012-01 で実装した create 用フォームを拡張）。

### フォーム実装方針

- 送信時に `new Date(form.concertDate).toISOString()` で UTC 変換（作成と同一）
- 任意フィールドが空文字列の場合は `undefined` に変換して送信（DynamoDB の `removeUndefinedValues: true` を活用）
- `submitLabel` props で「保存する」等のラベルを切り替え

### 削除確認

- 詳細ページに削除ボタンを設置
- ブラウザ標準の `window.confirm()` で確認ダイアログを表示（`listening-logs` 詳細ページと同一パターン）
- 削除成功後、`/concert-logs` 一覧へ遷移

---

## 8. 実装順序

1. 型定義追加（`UpdateConcertLogInput` を両 `types/index.ts`）
2. バックエンド基盤（`updateConcertLogSchema` を `schemas.ts` に追加）
3. Lambda 関数（`get.ts`, `update.ts`, `delete.ts`）とユニットテスト
4. CDK インフラ定義
5. Composable 拡張（`useConcertLogs.ts` に get/update/deleteLog 追加、`useConcertLog` 新設）
6. `ConcertLogForm.vue` に `initialValues` props を追加
7. コンポーネント（`ConcertLogDetail.vue`, `ConcertLogDetailTemplate.vue`, `ConcertLogEditTemplate.vue`）
8. ページ（`[id]/index.vue`, `[id]/edit.vue`）

---

## 9. 設計判断まとめ

| 決定事項                       | 採用方針                               | 主な理由                                                                   |
| ------------------------------ | -------------------------------------- | -------------------------------------------------------------------------- |
| 404 の存在隠蔽                 | userId 不一致でも 404 を返す           | 要件通り。他ユーザーのデータ存在を公開しない                               |
| 部分更新方式                   | `createConcertLogSchema.partial()`     | `updateListeningLogSchema` と同一パターン。一貫性確保                      |
| 楽観的ロック                   | `updateItem` ユーティリティを再利用    | 同時編集コンフリクト検出。`listening-logs` と同一実装で保守性を維持        |
| Delete Lambda の DynamoDB 権限 | `grantReadWriteData`                   | 既存アイテム取得（userId 確認）に ReadData が必要なため                    |
| `useConcertLog` の分離         | `useListeningLog` と同一パターンで新設 | 単一アイテム取得はリアクティブ `useFetch` を使い、詳細・編集ページで再利用 |
| `ConcertLogForm` の再利用      | `initialValues` props を追加して拡張   | 作成・編集で同一フォームを共有。`ListeningLogForm` と同一パターン          |
| 削除確認 UI                    | `window.confirm()`                     | 既存パターンと統一。専用モーダルは独立リファクタリングワークへ分離         |

---

## レビュー結果

<!-- レビュー後に記入してください -->

| 項目                  | 結果 | コメント |
| --------------------- | ---- | -------- |
| APIエンドポイント設計 | ok   |          |
| バックエンド実装方針  | ok   |          |
| CDKインフラ設計       | ok   |          |
| フロントエンド構成    | ok   |          |
| コンポーネント設計    | ok   |          |
| その他                | ok   |          |
