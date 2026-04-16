# 設計: ワーク015-02 楽曲マスタ書き込み API の管理者限定化

## 概要

楽曲マスタの書き込み API（`POST /pieces` / `PUT /pieces/{id}` / `DELETE /pieces/{id}`）を `admin` Cognito グループに所属するユーザーのみ実行可能とする。参照 API（`GET /pieces` / `GET /pieces/{id}`）は従来どおり認証不要で公開。

ワーク015-01 で作成済みの `admin` グループを前提に、API Gateway の Cognito Authorizer と Lambda 内認可の二段構えでサーバー側で確実に拒否できる構成にする。

---

## 方針の要点

### 認可強制の構成（採用案: Cognito Authorizer + Lambda 内グループ判定）

| 採用 | 案                                          | 概要                                                                                        |
| ---- | ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| ✅   | (B) 既存 Cognito Authorizer + Lambda 内判定 | 未認証は API Gateway Authorizer が 401 を返す。認証済みは Lambda で `cognito:groups` を確認 |
| -    | (A) カスタム Lambda Authorizer              | グループ条件まで Authorizer で強制。実装コスト・JWKS 検証等の自前実装が過剰                 |
| -    | (C) (A)+(B) 両方                            | セキュリティ最大だが重複により保守性が悪化                                                  |

**採用理由:**

- Cognito User Pool Authorizer には「グループ強制」機能がない（scope は OAuth2 Resource Server 用で groups 判定には使えない）
- JWT 署名検証・失効確認は Cognito Authorizer が担うため、Lambda 側では claims の内容確認のみで十分
- 本プロダクトの規模（書き込み API 3 本）に対して Lambda Authorizer 実装は過剰

### トークン種別

- `cognito:groups` クレームは ID Token / Access Token の双方に含まれる
- フロントエンドは既に ID Token を `Authorization: Bearer` ヘッダーで送信している
- 既存 `CognitoUserPoolsAuthorizer` は `identitySource` を指定していないためデフォルト動作（`method.request.header.Authorization`）で ID/Access いずれも受け付ける
- フロント・バック双方のトークン扱いは変更不要

### 未認証・権限不足時のステータス分離

| ケース                         | ステータス         | 返却元                                                            |
| ------------------------------ | ------------------ | ----------------------------------------------------------------- |
| 認証ヘッダーなし・無効トークン | `401 Unauthorized` | API Gateway (Cognito Authorizer)                                  |
| 認証済みだが `admin` 非所属    | `403 Forbidden`    | Lambda ハンドラ（`http-errors` → `createHandler` でレスポンス化） |

HTTP セマンティクス通りの分離とし、`work.md` の「403 もしくは 401」要件を満たす。

---

## 変更対象

| ファイル                                                     | 変更種別 | 内容                                                                           |
| ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------ |
| `backend/src/utils/auth.ts`                                  | 追加     | `getUserGroups` / `isAdmin` / `requireAdmin` を追加、`admin` 定数定義          |
| `backend/src/handlers/pieces/create.ts`                      | 変更     | 先頭で `requireAdmin(event)` を呼ぶ                                            |
| `backend/src/handlers/pieces/update.ts`                      | 変更     | 同上                                                                           |
| `backend/src/handlers/pieces/delete.ts`                      | 変更     | 同上                                                                           |
| `backend/src/test/fixtures.ts`                               | 変更     | `makeAuthEvent` に `groups` オプションを追加、`makeAdminEvent` を追加          |
| `backend/src/utils/auth.test.ts`                             | 追加     | 新規ユーティリティのユニットテスト                                             |
| `backend/src/handlers/pieces/{create,update,delete}.test.ts` | 変更     | admin / 一般 / 未認証 / 文字列クレーム の 4 系統テストを追加                   |
| `cdk/lib/classical-music-lake-stack.ts`                      | 変更     | `pieces` 書き込み 3 メソッドを `withAuth` に切替。CORS に `Authorization` 追加 |
| `docs/SPEC.md`                                               | 変更     | 4.5 楽曲マスタ API / 4.6 エラーレスポンス一覧に認可仕様・401/403 を反映        |

---

## バックエンド設計

### 新規ユーティリティ（`backend/src/utils/auth.ts` に追記）

- `ADMIN_GROUP_NAME` 定数: 文字列 `"admin"` を定義。マジックストリングを排除
- `getUserGroups(event)`:
  - `event.requestContext.authorizer.claims["cognito:groups"]` を取り出す
  - Cognito は複数グループ所属時にカンマ区切り文字列または配列のいずれかで渡す実装例があるため両対応する
    - 配列ならそのまま（文字列要素のみフィルタ）
    - 文字列ならカンマ分割 + トリム
    - undefined / 空文字なら空配列
  - throw はしない（Authorizer が未認証を先に弾く前提でも防御的に空配列）
- `isAdmin(event)`:
  - `getUserGroups(event)` に `ADMIN_GROUP_NAME` が含まれるか
- `requireAdmin(event)`:
  - `isAdmin` が false なら `createError.Forbidden("Admin privilege required")` を throw
  - `createHandler` の `httpErrorMiddleware` が 403 + `{ "message": "Admin privilege required" }` に変換する
- 既存の `CognitoAuthorizerContext.claims` 型が `cognito:groups` を未サポートのため、`unknown` から narrow するか型を緩める

### ハンドラ変更（`pieces/create.ts` / `update.ts` / `delete.ts`）

- 既存実装の先頭で `requireAdmin(event)` を呼び出すのみ
- それ以外のビジネスロジック（`parseRequestBody` / usecase 呼び出し）は現状維持
- `list.ts` / `get.ts` は変更なし（未認証アクセス可のまま）

### テスト戦略

#### フィクスチャ（`backend/src/test/fixtures.ts`）

- `makeAuthEvent(userId, overrides, groups?)` にオプション引数 `groups` を追加し、`claims["cognito:groups"]` を付与
- 既存呼び出しは後方互換（デフォルト未指定）
- `makeAdminEvent(userId, overrides)` ヘルパ: `makeAuthEvent` を薄くラップし `groups: ["admin"]` を渡す

#### ハンドラユニットテスト（`pieces/{create,update,delete}.test.ts`）

各ハンドラに以下のケースを追加（既存 `create.test.ts` の正常系を admin イベントに差し替える形）:

1. `makeAdminEvent` で 2xx が返る
2. `makeAuthEvent`（admin 非所属）で 403 + `{ message: "Admin privilege required" }`
3. `makeEvent()`（claims 無し）で 403（ローカルの直接呼び出し経路への防御）
4. `cognito:groups` が `"viewer,editor"`（文字列だが admin 非含有）で 403
5. `cognito:groups` が `"admin,editor"`（カンマ区切り文字列で admin 含有）で 2xx
6. 403 時に repository の save / delete が呼ばれていないこと（副作用未発生）

#### 新規ユーティリティテスト（`backend/src/utils/auth.test.ts`）

- `getUserGroups`: 配列形式 / カンマ区切り文字列 / 未定義 / 空文字の 4 パターン
- `isAdmin`: true / false の境界
- `requireAdmin`: throw する / しない

#### 非影響テスト

- `pieces/list.test.ts` / `get.test.ts` は変更しない
- 視聴ログ・コンサート記録・認証系の既存テストは変更しない

---

## CDK 設計

### API Gateway ルートの Authorizer 切替

- `pieces/create` / `pieces/update` / `pieces/delete` の `addMethod` オプションを `withoutAuth` → `withAuth`（既存 `cognitoAuthorizer`）に切り替える
- `pieces/list` / `pieces/get` は `withoutAuth` のまま据え置き
- `cognitoAuthorizer` は既存インスタンスをそのまま流用（`identitySource` 非指定でデフォルト）

### CORS 設定の補正

- `piecesResource` / `pieceResource` の `addCorsPreflight` の `allowHeaders` に `"Authorization"` を追加
- 現状 `["Content-Type"]` のみになっているとブラウザのプリフライトで `Authorization` ヘッダが拒否される
- GatewayResponse の CORS 設定（既存の `Default4xx` / `Default5xx`）は変更不要 — 401/403 時も CORS ヘッダ付きで返る

### 環境差分

- 既存と同じく `stageName` 毎に `withAuth` は同一挙動。環境分岐は不要

---

## ドキュメント設計（`docs/SPEC.md`）

### 4.5 楽曲マスタ API

- 先頭の「認証不要」注記を修正: 「参照系（`GET /pieces` / `GET /pieces/{id}`）は認証不要。書き込み系（`POST` / `PUT` / `DELETE`）は `admin` グループに所属する認証済みユーザーのみ実行可能」
- `POST /pieces` / `PUT /pieces/{id}` / `DELETE /pieces/{id}` のサブ節に以下を追記:
  - 認可ルール: `Authorization: Bearer {idToken}` が必須。ID Token の `cognito:groups` クレームに `admin` が含まれること
  - エラー: 認証ヘッダーなし・無効トークン → `401 Unauthorized`（API Gateway Authorizer）
  - エラー: 認証済みだが非管理者 → `403 Forbidden` + `{ "message": "Admin privilege required" }`
- スコープ外のフロント UI ガードは「ワーク015-03 で扱う」と明記

### 4.6 エラーレスポンス一覧

- 既存表に以下を追加:
  - `401 Unauthorized`: 認証必須エンドポイントで認証ヘッダー・トークンが不正（API Gateway 返却）
  - `403 Forbidden`: 認証済みだが権限不足（例: 楽曲マスタ書き込み API への非管理者アクセス）

### 5.1 AWSリソース > API Gateway（軽微）

- 楽曲マスタ書き込み系が Cognito Authorizer 配下になったことを補足

### 5.1 AWSリソース > Cognito（参照補強）

- 既にワーク015-01 で `admin` グループと `cognito:groups` クレームの記述あり。4.5 節から参照する形にする

---

## 非機能・安全性

- **サーバー側認可の一元化**: フロントエンドのガードに依存せず、サーバー側で確実に拒否する要件を満たす
- **既存機能非影響**:
  - 視聴ログ・コンサート記録・認証系 API は変更なし
  - 楽曲マスタの参照 API は未認証アクセス継続
  - フロントエンドの `usePieces`（参照）は変更不要
  - 書き込み系 composable のエラーハンドリング強化はワーク015-03 側のスコープ
- **IaC 整合性**: CDK 経由で 3 環境（dev/stg/prod）に同時反映される
- **ローリングデプロイ時の互換性**: デプロイ直後は全既存ユーザーが非管理者扱いになる。ワーク015-01 の手順でデプロイ前に初期管理者を `admin` グループへ追加しておく運用手順を事前レビューしておく

---

## 受入テストへの対応

| work.md チェック項目                  | 担保箇所                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| admin で POST/PUT/DELETE 成功         | `pieces/{create,update,delete}.test.ts` に `makeAdminEvent` ケース                    |
| 一般ユーザーで POST/PUT/DELETE → 403  | 同上（`makeAuthEvent` + groups 無し）で 403 を検証                                    |
| 未認証 POST → 403 または 401          | API Gateway が 401 を返す仕様。ハンドラ単体では `makeEvent()` で 403 を検証（防御的） |
| 403 を受けてもデータ未変更            | テスト内で repository モックの save/delete が未呼出であること                         |
| 未認証で GET /pieces, /pieces/{id} 可 | 既存 `list.test.ts` / `get.test.ts` が無改修でパス（`withoutAuth` 据え置き）          |
| 一般ユーザートークンでも GET 可       | CDK で GET は `withoutAuth` のまま。SPEC に記載                                       |
| 視聴ログ・コンサート記録 API 無変更   | ハンドラ・CDK ルートとも非変更。既存テストのパスを確認                                |
| 認証系 API 無変更                     | 同上                                                                                  |
| SPEC.md 反映                          | 4.5 / 4.6 / 5.1 の改訂                                                                |

---

## リスク・注意点

- **`cognito:groups` の型ブレ**: Cognito Authorizer 経由で渡る claims はカンマ区切り文字列で来る事例が多いが、配列のケースも想定し両対応を必ずユニットテストでカバーする
- **CORS `allowHeaders` の更新漏れ**: `pieces` 系のプリフライトに `Authorization` を足し忘れるとブラウザ fetch が失敗する。レビュー必須ポイント
- **Authorizer デフォルト挙動への依存**: `identitySource` 未指定のデフォルトに依存するため、CDK コメントで「ID/Access Token 両対応、`Authorization` ヘッダ」と明記する
- **フロントエンドの 403 UX**: 現状 `useAuthenticatedApi` は 401 のみ扱う。403 時は throw のみとなり UX 整備はワーク015-03 のスコープであることを `work.md` / SPEC に明記
- **初期管理者の事前設定**: リリース時点で管理者不在だと楽曲マスタを誰も編集できなくなるため、デプロイ前にワーク015-01 の OPERATIONS.md 手順で初期管理者を付与しておく

---

## レビュー

> ※ レビュアーはここに意見・指摘を記載してください。
