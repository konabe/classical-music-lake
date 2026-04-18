# 設計: ワーク015-03 管理者向けUIのロール判定ガード

## 概要

ワーク015-02 でサーバー側の認可（API 403）を確立した前提のうえで、フロントエンド側の UX ガードを実装する。管理者ロールを持つユーザーのみ管理系の導線・操作 UI を見せることで画面をシンプルに保ち、非管理者には関係のない UI を非表示にする。

対象範囲:

- `useAuth` composable への `isAdmin()` 追加
- ルートミドルウェア `admin.ts` の新規追加
- `HomeTemplate` / `PiecesTemplate` / `PieceDetailTemplate` への `isAdmin` prop 追加
- ページコンポーネント側での `isAdmin()` 呼び出しとテンプレートへの橋渡し

**セキュリティ境界はサーバー側 API（Lambda `requireAdmin()`）にある。フロントエンドのガードは UX 向上目的であり、セキュリティを担保しない。**

---

## 方針の要点

### 1. ロール判定の実装箇所（採用: useAuth composable 内に isAdmin() を追加）

| 採用 | 案                                          | 概要                                                                                                                         |
| ---- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| ✅   | useAuth に isAdmin() を追加                 | 既存の認証状態管理ロジックと同じ composable に集約。ページ・ミドルウェア双方から呼び出せる                                   |
| -    | ページコンポーネント内で直接 JWT をデコード | ロジック散在・重複。テスト困難                                                                                               |
| -    | Pinia store でリアクティブな状態として保持  | 過剰設計。ログアウト時に localStorage の ID Token が削除されるため、次回 isAdmin() 評価で自動的に false になる。store は不要 |

**採用理由:** ログアウト時に `clearTokens()` が ID Token を localStorage から削除するため、次回 `isAdmin()` 評価で自動的に false を返す。リアクティブな状態管理（store）なしに認証状態の変化に追従できる。

### 2. JWT 署名検証の省略（採用: base64url デコードのみ）

| 採用 | 案                                     | 概要                                                                      |
| ---- | -------------------------------------- | ------------------------------------------------------------------------- |
| ✅   | 署名検証なし・ペイロードのデコードのみ | UI ガード目的。セキュリティ境界はサーバー API 側                          |
| -    | JWKS エンドポイントで署名を検証        | ネットワーク依存・非同期処理が必要になり、同期的な isAdmin() と相性が悪い |

**採用理由:** トークンを改ざんしても API の 403 を越えられないため、クライアント側の署名検証はセキュリティ上の意味をなさない。むしろ非同期化によりミドルウェアや template の評価タイミングが複雑化するリスクを避ける。

### 3. cognito:groups フォーマット対応（採用: 配列・カンマ区切り文字列の両対応）

ワーク015-02 のバックエンド実装と対称的に、フロントエンドでも両フォーマットに対応する。Cognito の実装によってはカンマ区切り文字列で渡る事例があるため、配列と文字列のどちらでも正しく判定できるようにする。

### 4. ルートミドルウェアの設計（採用: defineNuxtRouteMiddleware + ページ単位 definePageMeta）

| 採用 | 案                                                      | 概要                                                |
| ---- | ------------------------------------------------------- | --------------------------------------------------- |
| ✅   | defineNuxtRouteMiddleware + definePageMeta で明示的適用 | Nuxt の標準機構。保護対象ページを明示的に宣言できる |
| -    | ページコンポーネント内で直接 useRouter().push()         | ミドルウェアの共通化ができない                      |
| -    | グローバルミドルウェアとして全ルートに適用              | 保護不要なルートでも毎回評価され意図が不明確になる  |

SSR スキップ（`import.meta.server` チェック）が必要な理由: localStorage はブラウザ環境にのみ存在するため。SPA モードでは実質クライアント側のみで動作するが、明示的なガードを置く。

### 5. テンプレートへの isAdmin prop 渡し（採用: ページで評価し props として渡す）

| 採用 | 案                                                             | 概要                                                                                 |
| ---- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| ✅   | ページが isAdmin() を呼び出し、テンプレートに props として渡す | テンプレートは表示ロジックのみに専念。useAuth への依存をテンプレート層に持ち込まない |
| -    | テンプレート内で useAuth を直接呼ぶ                            | テンプレートと composable が密結合。テスト時のモック境界が不明確になる               |

Atomic Design の方針（テンプレートはレイアウトとデータを受け取るだけ）との整合性を保つ。

---

## 変更対象

| ファイル                                               | 変更種別 | 内容                                                                               |
| ------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------- |
| `app/composables/useAuth.ts`                           | 変更     | `decodeJwtPayload()` ヘルパ関数と `isAdmin()` 関数を追加                           |
| `app/middleware/admin.ts`                              | 新規     | SSR スキップ付きルートミドルウェア。非管理者を TOP へリダイレクト                  |
| `app/pages/pieces/new.vue`                             | 変更     | `definePageMeta({ middleware: ["admin"] })` を追加                                 |
| `app/pages/pieces/[id]/edit.vue`                       | 変更     | 同上                                                                               |
| `app/pages/index.vue`                                  | 変更     | `isAdmin()` を呼び出し、HomeTemplate に `isAdmin` prop を渡す                      |
| `app/pages/pieces/index.vue`                           | 変更     | `isAdmin()` を呼び出し、PiecesTemplate に `isAdmin` prop を渡す                    |
| `app/pages/pieces/[id]/index.vue`                      | 変更     | `isAdmin()` を呼び出し、PieceDetailTemplate に `isAdmin` prop を渡す               |
| `app/components/templates/HomeTemplate.vue`            | 変更     | `isAdmin: boolean` prop を追加。管理者メニューセクションを `v-if="isAdmin"` で制御 |
| `app/components/templates/PiecesTemplate.vue`          | 変更     | `isAdmin: boolean` prop を追加。新規作成ボタンの表示を制御                         |
| `app/components/templates/PieceDetailTemplate.vue`     | 変更     | `isAdmin: boolean` prop を追加。編集・削除ボタンの表示を制御                       |
| `app/composables/useAuth.test.ts`                      | 変更     | `isAdmin` のテストケース（7パターン）を追加                                        |
| `app/middleware/admin.test.ts`                         | 新規     | ミドルウェアのユニットテスト                                                       |
| `app/components/templates/HomeTemplate.test.ts`        | 変更     | `isAdmin` prop に関するテストケースを追加                                          |
| `app/components/templates/PiecesTemplate.test.ts`      | 変更     | 同上                                                                               |
| `app/components/templates/PieceDetailTemplate.test.ts` | 変更     | 同上                                                                               |
| `app/components/molecules/PageHeader.vue`              | 変更     | `newPagePath` prop をオプショナルに変更（isAdmin false 時に undefined を渡すため） |
| `docs/ARCHITECTURE.md`                                 | 変更     | 認可セクションと「管理者ロールによる UI 差分」を追記                               |

---

## 各領域の詳細設計

### isAdmin()（useAuth composable）

- **対象トークン**: `ID_TOKEN_KEY`（`idToken`）を localStorage から取得する。`cognito:groups` クレームは ID Token に含まれ、フロントエンドがすでに ID Token を localStorage で管理しているため変更不要
- **デコード処理**: JWT の 3 分割構造（header.payload.signature）を前提とし、ペイロード部分（インデックス 1）のみを base64url デコードする。不正なトークン形式（3 分割でない・JSON パース失敗）は null を返すことで安全に false になる
- **グループ判定ロジック**:
  - 配列形式（`["admin"]`）の場合: `Array.includes("admin")` で判定
  - カンマ区切り文字列（`"admin,viewer"`）の場合: `split(",").map(trim).includes("admin")` で判定
  - `undefined` / 空文字の場合: false を返す
- **スナップショット設計**: 関数を呼び出すたびに localStorage を読む。Vue のリアクティブ状態としては保持しない。ページコンポーネントのレンダリング時に評価されるため、ログアウト後の再訪問では常に最新状態を反映する

### admin ミドルウェア

- `import.meta.server` が true のときは即 return（localStorage は SSR 環境に存在しない）
- `isAdmin() !== true` の条件で非管理者を判定（null / undefined / false を全て非管理者扱いにする防衛的な書き方）
- `navigateTo("/", { replace: true })` でリダイレクト。`replace: true` を使う理由: ブラウザの戻るボタンを押しても保護ページに戻れないようにするため
- 適用対象ページは `definePageMeta({ middleware: ["admin"] })` で明示的に指定:
  - `/pieces/new`（楽曲マスタ新規作成）
  - `/pieces/[id]/edit`（楽曲マスタ編集）

### テンプレートコンポーネント

- `isAdmin: boolean` を必須 props として受け取る（デフォルト値なし）
- 各テンプレートでの条件付き表示:
  - **HomeTemplate**: 管理者メニューセクション全体（`v-if="isAdmin"`）
  - **PiecesTemplate**: 新規作成ボタン（PageHeader の `:new-page-path` に undefined を渡すことで非表示化）
  - **PieceDetailTemplate**: 編集・削除ボタンを含む admin-actions 領域（`v-if="isAdmin"`）

### ページコンポーネント

- `const { isAdmin } = useAuth()` でデストラクチャし、`const isAdminUser = isAdmin()` として評価する
- テンプレートに `:is-admin="isAdminUser"` で渡す
- ページのセットアップ時（レンダリング時）に評価されるため、ログアウト後の再訪問では正しく false になる

---

## テスト設計

### isAdmin() のユニットテスト（useAuth.test.ts）

`makeIdToken(claims)` ヘルパ関数で fake JWT を生成し、各ケースを検証する。

| ケース                                              | 期待値 |
| --------------------------------------------------- | ------ |
| idToken が localStorage にない                      | false  |
| idToken が不正形式（"invalid-token"）               | false  |
| cognito:groups が配列 ["admin"] を含む              | true   |
| cognito:groups が配列 ["viewer"] のみ               | false  |
| cognito:groups がカンマ区切り文字列 "admin,viewer"  | true   |
| cognito:groups がカンマ区切り文字列 "viewer,editor" | false  |
| cognito:groups クレームが存在しない                 | false  |

### admin ミドルウェアのユニットテスト（admin.test.ts）

`navigateTo` と `useAuth` の `isAdmin` を `vi.hoisted` + `vi.mock` でスタブする。

| ケース                                   | 期待値                                    |
| ---------------------------------------- | ----------------------------------------- |
| isAdmin() が true のとき                 | navigateTo を呼ばない                     |
| isAdmin() が false（一般ユーザー）のとき | navigateTo("/", { replace: true }) を呼ぶ |
| isAdmin() が false（未ログイン）のとき   | navigateTo("/", { replace: true }) を呼ぶ |

### テンプレートコンポーネントのテスト

- `isAdmin: true` で渡したとき管理者向け要素（ボタン・セクション）が存在すること
- `isAdmin: false` で渡したとき管理者向け要素が DOM に存在しないこと
- HomeTemplate / PiecesTemplate / PieceDetailTemplate の各テンプレートについて記述する

---

## 非機能・安全性

- **セキュリティ境界の明確化**: `isAdmin()` は UI ガード目的であり、セキュリティを担保しない。悪意あるユーザーが localStorage の ID Token を改ざんしても、API 側が 403 を返すことで実害を防ぐ（ワーク015-02 の `requireAdmin()` によるサーバー側強制）
- **認証状態変化への追従**: ログアウト時に `clearTokens()` が ID Token を localStorage から削除するため、次回 `isAdmin()` 評価で false を返す。ページコンポーネントがレンダリング時に評価するため、ページ再訪問で状態が更新される
- **既存機能への非影響**: 楽曲マスタの閲覧ページ（`/pieces`、`/pieces/[id]`）は認証不要で引き続き誰でもアクセス可能。ミドルウェアは新規作成・編集ページにのみ適用

---

## 受入テストへの対応

| work.md チェック項目                                              | 担保箇所                                                            |
| ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| 管理者で管理者メニューセクションが表示される                      | `HomeTemplate.test.ts` の isAdmin=true ケース                       |
| 管理者で楽曲一覧に新規作成ボタンが表示される                      | `PiecesTemplate.test.ts` の isAdmin=true ケース                     |
| 管理者で楽曲詳細に編集・削除ボタンが表示される                    | `PieceDetailTemplate.test.ts` の isAdmin=true ケース                |
| 管理者が楽曲新規作成・編集ページに URL で直接アクセスできる       | `admin.test.ts` の isAdmin=true ケース（リダイレクトなし）          |
| 一般ユーザーで管理者メニューが非表示                              | `HomeTemplate.test.ts` の isAdmin=false ケース                      |
| 一般ユーザーで新規作成ボタンが非表示                              | `PiecesTemplate.test.ts` の isAdmin=false ケース                    |
| 一般ユーザーで編集・削除ボタンが非表示                            | `PieceDetailTemplate.test.ts` の isAdmin=false ケース               |
| 一般ユーザーが新規作成・編集ページに直接アクセスすると TOP へ遷移 | `admin.test.ts` の isAdmin=false ケース                             |
| 未ログインで管理者向け UI が表示されない                          | isAdmin() が false を返す（ID Token なし）テストケース              |
| ログアウト後に管理者向けセクション・ボタンが非表示                | clearTokens 後に isAdmin() が false を返す仕様（localStorage 削除） |
| ARCHITECTURE.md の更新                                            | 認可・UI 差分セクションの追記                                       |

---

## リスク・注意点

- **グループ変更のタイミング**: Cognito グループへの追加・削除は再ログイン後に ID Token に反映される。ログアウト前後の切り替わりタイミングでは古いクレームが残る可能性があるが、これは Cognito の仕様上の制約であり、015-01 の OPERATIONS.md に既に記載済み
- **SSR スキップの必要性**: `import.meta.server` のスキップを忘れた場合、SSR 実行時に `localStorage is not defined` エラーが発生する。SPA（SSR 無効）のため現状は問題ないが、明示的なガードを維持すること
- **ページ単位ミドルウェア適用漏れ**: 今後管理者専用ページを追加する際に `definePageMeta({ middleware: ["admin"] })` の記述を忘れるリスクがある。設計方針（ページ単位での明示的指定）をチームで共有し、レビューチェックポイントに含める
- **クライアント側改ざん**: localStorage の ID Token を書き換えることで `isAdmin()` が true を返すよう細工できるが、API の 403 で無効化されるため実害はない。この前提でセキュリティ要件を満たしていることをレビューで確認する

---

## レビュー

> ※ レビュアーはここに意見・指摘を記載してください。
