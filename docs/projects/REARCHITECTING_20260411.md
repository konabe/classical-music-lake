# リアーキテクチャリング チェックリスト

## 🔴 優先度: 高

### Composable の HTTP ロジック統一

`useListeningLogs.ts` と `useConcertLogs.ts` で以下の関数が一字一句同じで重複（合計約270行）。
違いはエンドポイント名（`listening-logs` vs `concert-logs`）のみ。

| 重複関数             | 行数    |
| -------------------- | ------- |
| `getAuthHeaders`     | 5–8行   |
| `handleAuthError`    | 10–28行 |
| `throwResponseError` | 30–35行 |
| `authenticatedFetch` | 41–68行 |

**追加で判明した問題点:**

- **二重リトライのリスク** — 401エラー時に `useFetch` の `onResponseError` と `authenticatedFetch` 内の401チェックが両方発火する可能性がある。`useAuth` 側の `refreshInFlight` で多重実行は防いでいるが、リトライ自体は2経路から起きうる
- **ネットワークエラーの未処理** — `create` / `update` / `deleteLog` で `fetch` 例外・`response.json()` パースエラーが未キャッチのままコンポーネントに伝播する
- **型安全性の欠如** — `response.json()` の戻り値が `any` のままキャストのみで返却（`useAuth.ts` では厳密に検証しているのに不統一）
- **テスタビリティ** — `useApiBase()` / `useRouter()` / `useAuth()` / グローバル `fetch` を直接呼び出しているためモック注入不可。ユニットテストが書けず統合テストのみ対応可能

**改善方針:** `useAuthenticatedApi()` を新設し、リトライ制御・エラー正規化・型検証を集約する。`useListeningLogs` / `useConcertLogs` はエンドポイント名を渡して呼ぶだけにする。

- [x] `useListeningLogs` と `useConcertLogs` に完全複製されている `authenticatedFetch()` / `handleAuthError()` / `getAuthHeaders()` を `useAuthenticatedApi` に抽出
- [x] `useAuthenticatedApi` 内でリトライ経路を一本化し、二重リトライを排除（`useFetch` と `authenticatedFetch` は GET/mutations で経路が分離されており衝突しないことをコメントで明示）
- [x] ネットワークエラー・JSONパースエラーを `useAuthenticatedApi` 内で正規化してハンドリング（`doFetch` でネットワーク例外を正規化、`parseJsonResponse<T>` でJSONパースエラーをキャッチ）
- [x] `response.json()` の戻り値に型検証を追加（`parseJsonResponse<T>` を導入し `create`・`update` の戻り値を型付き取得に統一）
- [x] `fetch` のテスタビリティ（既存の `vi.stubGlobal("fetch", ...)` パターンで対応済み。構造的変更不要と判断）

---

## 🟡 優先度: 中

### エラーハンドリングの統一

- [x] バックエンドでエラー形式が3種類混在（直接返却 / ヘルパー関数 / middleware）— すべてのLambdaで `response.ok()` / `response.badRequest()` ヘルパーを使用に統一（`created` / `unauthorized` / `forbidden` を `response.ts` に追加し `auth/register.ts` / `auth/login.ts` / `auth/refresh.ts` を更新）
- [x] フロントエンドで戻り値 vs 例外スローの2パターン混在 — `{ success, error?, errorType? }` に統一（`handleOAuthCallback` を `Promise<{ success: boolean; error?: string }>` に変更）

### バリデーションロジックの一元化

- [ ] パスワードバリデーションが `useAuth.ts` と `backend/src/utils/schemas.ts` で二重定義 — `shared/` に移動
- [ ] フロントエンドに `isValidRating()` 相当がない — 共有バリデーション関数として `shared/validators.ts` に集約

### `useAuth` の責務分離

- [ ] トークン管理（localStorage操作）を `useTokenStorage()` に分離
- [ ] Google OAuth 処理を `useOAuth()` に分離
- [ ] バリデーション関数を `shared/` に移動

### ConcertLogForm のロジック分離

- [ ] ピース追加・削除・並び替え・初期化ロジックを `usePieceSelector()` composable に抽出（現在 `ConcertLogForm.vue` に直書き）

---

## 🟢 優先度: 低

### コンポーネント設計の整理

- [ ] `ListeningLogItem` と `ConcertLogItem` のスタイルが類似 — 共通の `ItemCard` 基盤コンポーネントを検討
- [ ] `usePieces()` が複数コンポーネントで個別呼び出し — Pinia 導入によるマスタデータの一元管理を検討

### アーキテクチャ全般

- [ ] 依存方向の確認 — composable の依存グラフを整理し、循環依存がないか検証
- [ ] テスタビリティ確認 — 各 composable が単体でテスト可能か（依存注入できるか）
- [ ] 型定義ファイルの整理 — フロントエンドの型定義が `app/types/index.ts` に集約されているか確認
