# Work 014-01: 楽曲マスタ一覧のページネーション対応 - 設計

関連 Issue: konabe/classical-music-lake#295
親要件: [`./work.md`](./work.md)

## 設計方針サマリ

- バックエンドは既存 Scan をベースに、**DynamoDB `LastEvaluatedKey` を Base64(JSON) でエンコードした「不透明カーソル」** を返すカーソル型ページングに切り替える。
- フロントエンドは **`usePiecesPaginated`（1 ページ取得＋追加ロード制御）** と **`usePiecesAll`（カーソルを辿って自動で全件を集約する互換ヘルパー）** の 2 本に分け、既存画面の全件前提の呼び出しを壊さない。
- `/pieces` 一覧は IntersectionObserver ベースの無限スクロールに置き換え、エラー時の再試行 UI と末尾到達表示を備える。
- ページング用型 `Paginated<T>` と既定値定数（`PIECES_PAGE_SIZE_DEFAULT=50` / `PIECES_PAGE_SIZE_MAX=100`）は **`shared/` に集約**し、将来の視聴ログ・コンサート記録への転用に備える。
- `GET /pieces` は **破壊的変更**（配列 → `{ items, nextCursor }`）として、フロントと**同一 PR で同時リリース**する。

## レイヤー別変更方針

### バックエンド

#### handlers/pieces/list.ts

- `event.queryStringParameters` から `limit` / `cursor` を抽出し、Zod スキーマ（`listPiecesQuerySchema`）で検証する。
- 検証失敗（limit 範囲外・型不正・cursor 文字列不正）は `400 Bad Request` を返す。
- Usecase に `{ limit, cursor }` を渡し、戻りの `{ items, nextCursor }` をそのまま JSON で返却する。

#### usecases/piece-usecase.ts

- `list(): Promise<Piece[]>` を `list({ limit, cursor }): Promise<Paginated<Piece>>` に置換する。
- 要件（ソート順は Scan の戻り順を維持＝順不同）に合わせ、**既存の `sortByTitleJa` 相当のメモリ内ソートは削除**する。

#### repositories/piece-repository.ts

- 既存 `findAll` は**廃止せず残す**が、`usePiecesAll`（後述の「互換ヘルパー」）が不要になった時点で削除する前提のため、**JSDoc の `@deprecated` タグを付与**する。コメントには「新規コードでは `findPage` を使うこと」「視聴ログ・コンサート記録への本 Work のページング展開が完了したら削除予定」を明記する。
- 新たに `findPage({ limit, exclusiveStartKey }): Promise<{ items: Piece[]; lastEvaluatedKey?: Record<string, unknown> }>` を追加。

#### utils/dynamodb.ts

- 既存 `scanAllItems` は保持（副作用回避）するが、**`@deprecated` タグ**を付与する（新規コードでは `scanPage` を使う方針を明示）。将来的に `piece-repository.findAll` が削除された時点で合わせて削除予定。
- 新規 `scanPage<T>(tableName, { limit, exclusiveStartKey })` を追加。単発の `Scan` 結果（`Items` と `LastEvaluatedKey`）をそのまま返すシンプルな薄いラッパ。
- 将来の再利用向けに、`scanAllItems` の実装を `scanPage` に内部委譲する形にリファクタしても良いが、今回の Work のスコープ外とし現行挙動を維持する。

#### utils/cursor.ts（新規）

- `encodeCursor(lastEvaluatedKey: Record<string, unknown>): string` と `decodeCursor(raw: string): Record<string, unknown>` の 2 関数を提供する。
- フォーマットは `base64url(JSON.stringify({ v: 1, k: lastEvaluatedKey }))`。
  - バージョン（`v`）を含めて将来のスキーマ変更（GSI 追加・複合キー化など）に備える。未知バージョン検出時は `InvalidCursor` として 400 を返す。
  - `base64url` を採用（URL セーフ）。改ざん検出（HMAC 等）は本 Work のスコープでは不要と判断（後述の「判断記録」参照）。
- デコード失敗時はユーティリティ層で明示的に型付きエラーを投げ、ハンドラー層で `400 Bad Request` に変換する。

#### utils/schemas.ts

- `listPiecesQuerySchema` を追加する。
  - `limit`: `z.coerce.number().int()` に `min` / `max` / `default` を付与。**数値リテラルはハードコードせず `shared/constants.ts` の `PIECES_PAGE_SIZE_MIN` / `PIECES_PAGE_SIZE_MAX` / `PIECES_PAGE_SIZE_DEFAULT` を import して適用する**（フロントと閾値を単一ソース化する）。
  - `cursor`: 任意の文字列。**フォーマット検証には Zod v4 の `z.base64url()` を利用する**（本プロジェクトは `zod@^4.3.6` を採用。`z.base64url()` は URL セーフ Base64 の形式を文字レベルで検証する）。
    - これで「そもそも Base64URL として不正な文字列」はハンドラー層で 400 にできる。
    - 形式は正しいがデコード後の JSON が壊れている / 未知の `v`（バージョン）/ 想定しないキー構造、といった**意味的な不正**は `decodeCursor`（ユーティリティ層）で検出し、同じく 400 に変換する。
    - Zod v4 以前に慣れた読者向けの補足: `z.string().base64()` 系の API ではなく Zod v4 のトップレベル `z.base64url()` を使う。

#### 影響範囲

- 他の Lambda（視聴ログ・コンサート記録・pieces の他 CRUD 系）には変更なし。
- API Gateway 設定（ルート・Authorizer）は変更不要（クエリパラメータはプロキシで透過）。

### 共通（shared）

- `shared/constants.ts` に以下を追加。
  - `PIECES_PAGE_SIZE_DEFAULT = 50`
  - `PIECES_PAGE_SIZE_MAX = 100`
  - `PIECES_PAGE_SIZE_MIN = 1`
- `shared/` に `Paginated<T> = { items: T[]; nextCursor: string | null }` 型を定義し、`app/types/index.ts` / `backend/src/types/index.ts` から re-export。

### フロントエンド

#### composables/usePieces.ts

現行の全件取得前提の composable を次の 2 本構成に整理する。

- **`usePiecesPaginated()`**: 無限スクロール用
  - 公開 I/F（抽象レベル）: リアクティブな `items`・`nextCursor`・`pending`・`error`・`hasMore` と、`loadMore()` / `reset()` / `retry()` の操作。
  - 挙動: 呼び出しごとに 1 ページ単位で API を叩き、`items` に追記。`nextCursor === null` で `hasMore` が false になる。
  - 作成・更新・削除は同 composable 内に統合し、成功時に `reset()` → 1 ページ目からの再取得を保証する。
- **`usePiecesAll()`**: 互換ヘルパー（全件集約）※**`@deprecated` 付きで導入**
  - 内部で `nextCursor` を辿って全件を集約し、既存の `Ref<Piece[] | null>` 類似の I/F を提供。
  - 対象呼び出し元: `/concert-logs/new`（楽曲選択ドロップダウン）など「全件前提」の画面。
  - **位置づけ**: 既存画面を破壊しないための暫定ヘルパーであり、将来的には呼び出し元を検索 / 絞り込み前提の UI に作り替え、この関数自体を削除する予定。そのため `@deprecated` JSDoc を付与し、コメントに「新規コードでは `usePiecesPaginated` を使うこと」「呼び出し元移行完了後に削除予定」を明記する。
  - 無限取得のハードガード: 合計件数上限・連続 0 件応答の上限を設け、越えたら中断してエラー化する。上限値は `shared/constants.ts` にまとめる（例: `PIECES_ALL_MAX_TOTAL`, `PIECES_ALL_MAX_EMPTY_PAGES`）。
- `/pieces/[id]`・`/pieces/[id]/edit` などの**単体取得**は既存の `usePiece(id)`（GET /pieces/{id}）をそのまま使う（一覧側の変更の影響なし）。

#### pages/pieces/index.vue

- テンプレート構造自体は現行の `PieceList` 利用を踏襲しつつ、一覧末尾に **センチネル要素（空の div）** を置き、IntersectionObserver で可視化を検知して `loadMore()` を呼ぶ構成に変更する。
- 状態 UI: ローディング表示・エラー表示 + 再試行ボタン・末尾到達表示（「これ以上ありません」）を追加する。
- SSR 無効（SPA）前提のため、IntersectionObserver は `onMounted` 内で生成、`onUnmounted` で `disconnect` する。防御的に `process.client` ガードを入れる。
- **二重ロード防止**: `pending === true` の間は observer コールバックを no-op にする。

#### components

- 無限スクロール固有のセンチネル挙動・状態 UI は、一覧画面の薄い実装として `pages/pieces/index.vue` 内に閉じ込めるか、Atomic Design の organism（例: `PieceListInfinite`）として切り出すか、Work 実装フェーズの詳細見積もり時に確定する。設計上はどちらでも受け入れテストは満たす。

### ドキュメント

- `docs/SPEC.md`
  - 「4. API 仕様」の楽曲マスタ API セクションに、`GET /pieces` のクエリパラメータ（`limit`・`cursor`）とレスポンス形式（`{ items, nextCursor }`）を追記。
  - 「9.1 制限事項」の「ページネーションなし（フロント向け）」から楽曲マスタを外す、もしくは楽曲マスタは対応済みの旨を明記。
- `docs/ARCHITECTURE.md` に差分はない見込み（構成要素・データフローは据え置き）。

## カーソル設計の判断記録

- **採用**: `base64url(JSON.stringify({ v: 1, k: lastEvaluatedKey }))`。
- **改ざん検出（HMAC 署名）は不採用**。
  - 楽曲マスタは全ユーザ共通のマスタデータでテナント境界を超えないため、他ユーザの情報漏洩リスクがない。
  - 将来の視聴ログ・コンサート記録で同じ仕組みを転用する際は、サーバ側で `userId` を必ずトークンから再取得して Query 条件に組み込むため、カーソルに含めない設計とすることで改ざんの影響を無害化できる（別 Work で扱う）。
- **バージョン（`v`）を含める理由**: 将来 GSI 追加や複合キー化で `LastEvaluatedKey` の形が変わった際の互換性ブレイクを、明示的に 400 エラーで気づけるようにするため。

## `limit` バリデーション方針の判断記録

- **採用**: Zod (`z.coerce.number().int().min(1).max(100).default(50)`)。
- 範囲外 / 非数値 / 上限超過は一律 400。**上限クランプ（100 に丸める）は不採用**（silent な切り詰めは利用者を混乱させる）。

## `usePieces` 設計の判断記録

- **採用**: `usePiecesPaginated` と `usePiecesAll` の 2 関数併置。
- **却下**: 単一関数で `mode: 'all' | 'page'` を切替える案（型分岐とテスト面が複雑化）。
- **却下**: 呼び出し側（`/concert-logs/new` など）で個別にループ取得する案（重複実装・責務の分散）。

## 無限スクロール UI の判断記録

- **採用**: IntersectionObserver + センチネル要素。
- **却下**: スクロール位置 + `offsetHeight` 計測（精度と再描画コストで劣る）。
- **却下**: 「もっと読み込む」ボタン UI（要件で無限スクロールを指定）。

## テスト戦略

- **backend / handlers/pieces/list.test.ts**
  - `limit` 境界（未指定 → 50、`1`、`100`、`0`、`101`、`"abc"`、`-1`）での挙動。
  - `cursor` ラウンドトリップ（エンコード → 次リクエスト → 続きの取得 → 重複なし）。
  - `cursor` 不正値（壊れた Base64、壊れた JSON、未知バージョン）で 400。
  - 件数ゼロ時に `items: []`, `nextCursor: null`。
  - `LastEvaluatedKey` があるが `Items` が空（上記「落とし穴」参照）のケースで `nextCursor` が正しくセットされること。
- **backend / utils/cursor.test.ts**
  - encode/decode 可逆性。
  - バージョン検査（未知バージョンは例外）。
- **backend / utils/dynamodb.test.ts**
  - `scanPage` が `ExclusiveStartKey` を正しく渡し、`LastEvaluatedKey` を戻り値に含めること。
- **frontend / composables/usePieces.test.ts**
  - `usePiecesPaginated`: 初回ロード・2 ページ目追加・`hasMore` 状態遷移・`reset()`・`retry()`・エラー応答時の state。
  - `usePiecesAll`: 自動反復の停止条件、連続 0 件応答のハードガード。
- **frontend / pages/pieces/index.test.ts**
  - IntersectionObserver を `vi.stubGlobal` でモックし、可視化コールバック発火 → `loadMore` 呼び出し。
  - `pending` 中の二重発火防止。
  - エラー UI と再試行ボタンのクリック挙動。

## 実装ステップ（依存順）

1. `shared/constants.ts`（定数）と `shared` 側の `Paginated<T>` 型追加。以降の型の前提。
2. `backend/utils/cursor.ts` 実装・単体テスト。
3. `backend/utils/dynamodb.ts` に `scanPage` 追加・単体テスト。
4. `backend/utils/schemas.ts` に `listPiecesQuerySchema` 追加。
5. `backend/repositories/piece-repository.ts` に `findPage` 追加（ステップ 2-4 に依存）。
6. `backend/usecases/piece-usecase.ts` の `list` を差し替え、既存のメモリ内ソートを削除。
7. `backend/handlers/pieces/list.ts` の実装差し替えとテスト全面更新（バックエンド契約確定）。
8. `docs/SPEC.md` の API 仕様・制限事項の更新（バックエンド契約を文書反映）。
9. `app/composables/usePieces.ts` を `usePiecesPaginated` / `usePiecesAll` に再編し、テスト更新。
10. `/concert-logs/new`・`/pieces/[id]`・`/pieces/[id]/edit` 等の呼び出し差し替え（壊れないことをテスト）。
11. `app/pages/pieces/index.vue` の無限スクロール対応とテスト。
12. ローカルでの手動 E2E（初回ロード・追加ロード・エラー再試行・末尾到達）確認。

## 破壊的変更の扱い

- API バージョンは据え置き（`/pieces` のまま）。
- フロントエンド・バックエンドを**同一 PR で同時リリース**する。
- 外部利用者はいない前提のため、段階的移行（`?page=1` 互換・二重レスポンス）は行わない。
- コミット種別は `feat!(pieces): ...` 等の破壊的変更マーカーを付与する。

## 落とし穴・リスク

- **LastEvaluatedKey あり / Items 空**: DynamoDB Scan は 1MB 制限等で「`LastEvaluatedKey` があるが今回の応答の `Items` は 0 件」のケースがあり得る。`hasMore` は**`nextCursor` の有無だけで判定**し、UI は items 長に依存しない。無限ループ対策として「連続で空応答が続く回数」に上限を設け、越えたらエラー化する（`usePiecesPaginated` / `usePiecesAll` 両方）。
- **ソート順の非一貫性**: Scan 順は保証されないため、UI 側は表示順の期待を持たせない。SPEC に順不同である旨を明記する。
- **重複描画**: `create` / `update` / `delete` 後に `reset()` を呼び忘れると既存の `items` に重複 push が起きる。composable 側で「ミューテーション成功時に自動 `reset()`」を保証する。
- **リソース解放**: IntersectionObserver を `onUnmounted` で確実に `disconnect` する。HMR / ページ遷移時のリーク防止。

## スコープ外・将来課題

- 視聴ログ・コンサート記録一覧のページネーション（本 Work で導入する共通ユーティリティ（`scanPage`・`cursor.ts`・`Paginated<T>`）を使って別 Work で対応）。
- GSI 追加によるサーバ側ソート（Piece の `composer` 別一覧や視聴ログの `listenedAt` 降順など）。
- URL への `cursor` 反映（ブラウザバックでの位置復元）。
- 楽曲マスタの検索・フィルタリング。

---

## レビュー結果

> レビュー観点の例:
>
> - 破壊的変更の扱い（同一 PR 同時リリースで良いか）
> - カーソルを Base64(JSON) とする判断の妥当性（HMAC 不要の判断）
> - `usePiecesPaginated` / `usePiecesAll` 2 本構成の是非
> - 実装ステップの依存順
> - テスト観点の網羅性

### 指摘事項（Round 1 / PR #478）

| #    | 箇所                                                       | 指摘                                                                                            |
| ---- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| R1-1 | `piece-repository.ts` の `findAll` 存置                    | `@deprecated` JSDoc を付与して方針を明示してほしい                                              |
| R1-2 | `utils/schemas.ts` の `limit` の `min` / `max` / `default` | ハードコードせず `constants.ts` から引用するべき                                                |
| R1-3 | `utils/schemas.ts` の `cursor` のフォーマット検証          | Zod に Base64 を検証する機能はないか（`z.string().min(1).optional()` だけでは不十分ではないか） |
| R1-4 | `usePiecesAll()`                                           | これも `@deprecated` 扱いにしてよいか                                                           |

### 対応方針（Round 1）

| #    | 対応                                                                                                                                                                                                                                                                                                                          |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1-1 | `piece-repository.findAll` に `@deprecated` を付与する旨を「レイヤー別変更方針」セクションに追記。将来の削除条件（Piece 以外への Work 展開完了時）も記載                                                                                                                                                                      |
| R1-2 | `shared/constants.ts` に `PIECES_PAGE_SIZE_MIN` / `PIECES_PAGE_SIZE_MAX` / `PIECES_PAGE_SIZE_DEFAULT` を置き、Zod スキーマから import して適用する方針を明記。フロントと同じ定数を共有することで閾値の単一ソース化を担保                                                                                                      |
| R1-3 | 本プロジェクトは `zod@^4.3.6` を採用しており、Zod v4 にはトップレベル `z.base64url()` が存在する。これを利用して「文字レベルの Base64URL 形式」をスキーマで検証。形式 OK だが意味的に不正（壊れた JSON、未知の `v`、想定外のキー構造）は `decodeCursor` 側で検出し 400 に変換する二段構え。スキーマ定義と落とし穴の補足を追記 |
| R1-4 | `usePiecesAll` も「既存画面互換のための暫定ヘルパー」と位置づけ、`@deprecated` JSDoc を付けて「呼び出し元の UI 改修完了後に削除予定」と明記。ハードガード値（件数上限・連続 0 件上限）も `shared/constants.ts` へ寄せる方針とした                                                                                             |
