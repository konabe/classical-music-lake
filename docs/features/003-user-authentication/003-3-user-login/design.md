# ユーザーログイン - 設計書

## 概要

フロントエンドのログインフォーム、バックエンド Lambda、Cognito を連携させてユーザー認証機能を実装する。

## システムフロー

```text
ユーザー入力
    ↓
[ログインフォーム (Nuxt)]
    - メール入力
    - パスワード入力
    - バリデーション（クライアント側）
    ↓
POST /auth/login
    ↓
[Lambda: login.ts]
    - リクエスト検証
    - Cognito へ認証要求（InitiateAuth または AdminInitiateAuth API）
    ↓
AWS Cognito User Pool
    - ユーザー認証
    - JWT トークン生成
    ↓
JWT トークン返却
    ↓
[フロントエンド]
    - トークンをローカルストレージ/Cookie に保存
    - ホームページ/視聴ログ一覧へナビゲート
```

## フロントエンド設計

### ページ・コンポーネント

- **ページ**: `pages/auth/login.vue`
  - ログインフォーム（`<input type="email">`, `<input type="password">`）
  - ログインボタン、登録画面へのリンク

- **Composable**: `composables/useAuth.ts`
  - API 呼び出しロジック
  - トークン保存・管理
  - バリデーション（クライアント側）
  - エラーハンドリング

### バリデーション（クライアント側）

| フィールド     | ルール                 | エラーメッセージ                                                              |
| -------------- | ---------------------- | ----------------------------------------------------------------------------- |
| **メール**     | 入力必須、形式チェック | 「メールアドレスを入力してください」 / 「有効なメール形式で入力してください」 |
| **パスワード** | 入力必須               | 「パスワードを入力してください」                                              |

### トークン保存方式

**選択肢と判断**:

- **localStorage**: シンプル、実装容易（XSS に脆弱）
- **Secure Cookie**: XSS 対策、実装複雑、CSRF 対策が別途必要
- **SessionStorage**: タブごとに独立、一定のセキュリティ性

**採用**: **Secure Cookie（HttpOnly、Secure）** （XSS 攻撃によるトークン窃取を防止）

### トークン管理の実装方針

- **refresh token**: HttpOnly Secure Cookie に保存（JavaScript からアクセス不可でセキュリティを確保）
- **access token**: 短寿命化（60 分以下）し、必要に応じて refresh token で更新する
- API 呼び出し時に access token を Authorization ヘッダーへ自動付加する。ヘッダー注入は `useApiBase` ラッパーを通じてリクエストを集中管理し、`usePieces.ts` と `useListeningLogs.ts` が単一の composable HTTP ラッパー（`useApiBase`）を呼ぶ構成とする
- ログアウト時には Cookie と localStorage の両方をクリアする

#### Interceptor/Plugin 採用パターン

- 採用パターン: composables ベース（`useApiBase` ラッパー）
- Authorization ヘッダーの注入責任: `useApiBase` が一元管理
- 影響する symbol: `usePieces.ts`、`useListeningLogs.ts`、`useApiBase`

### UI フロー

1. ユーザーがログインフォームにアクセス
2. メール・パスワード入力
3. ログインボタン押下 → クライアント側バリデーション
4. API 呼び出し（ローディング表示）
5. **成功時**: トークンを localStorage に保存、ホームページへナビゲート
6. **エラー時**: エラーメッセージ表示
   - 認証失敗: 「メールアドレスまたはパスワードが正しくありません」
   - メール未確認: 「メールアドレスを確認してください」
   - その他: 「ログインに失敗しました。時間をおいてお試しください」

## バックエンド設計

### エンドポイント

```http
POST /auth/login
Content-Type: application/json

リクエスト:
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

レスポンス (200 OK):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}

レスポンス (401 Unauthorized):
{
  "error": "InvalidCredentials",
  "message": "Email or password is incorrect."
}

レスポンス (403 Forbidden):
{
  "error": "UserNotConfirmed",
  "message": "User account is not confirmed. Please verify your email."
}
```

### Lambda 関数: `backend/src/auth/login.ts`

#### 処理フロー

1. **リクエスト検証**
   - `email`, `password` の存在確認

2. **Cognito へのユーザー認証**
   - `InitiateAuth()` または `AdminInitiateAuth()` を呼び出し
   - AuthFlow: `USER_PASSWORD_AUTH` または `ADMIN_NO_SRP_AUTH`
   - JWT トークンを取得

3. **レスポンス返却**
   - 成功: 200 OK, アクセストークンとトークンタイプ、有効期限を返却
   - エラー: 適切なステータスコードとエラーメッセージ

#### エラーハンドリング

| Cognito エラー              | HTTP ステータス           | レスポンス                                        |
| --------------------------- | ------------------------- | ------------------------------------------------- |
| `NotAuthorizedException`    | 401 Unauthorized          | `{ error: "InvalidCredentials", message: "..." }` |
| `UserNotConfirmedException` | 403 Forbidden             | `{ error: "UserNotConfirmed", message: "..." }`   |
| `UserNotFoundException`     | 401 Unauthorized          | `{ error: "InvalidCredentials", message: "..." }` |
| `TooManyRequestsException`  | 429 Too Many Requests     | `{ error: "TooManyRequests", message: "..." }`    |
| その他                      | 500 Internal Server Error | `{ error: "InternalError", message: "..." }`      |

### API Gateway との連携

- Authorizer なし（ログインエンドポイントは認証不要）

## セキュリティ考慮事項

### 実装予定

- HTTPS のみ（本番環境）
- トークン有効期限（60 分）
- Rate Limiting（ログイン: 5 req/min）

### 実装しない

- 多要素認証（将来フェーズ）
- ロックアウト後の復旧 UI（Cognito が自動管理）

## トレードオフ・判断理由

| 項目                 | 選択                      | 理由                                                                                               |
| -------------------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| **認証フロー**       | USER_PASSWORD_AUTH        | シンプル、Cognito 標準                                                                             |
| **トークン保存**     | Secure Cookie（HttpOnly） | XSS によるトークン窃取を防止。refresh token は HttpOnly Secure Cookie、access token は短寿命で管理 |
| **エラーメッセージ** | 汎用化                    | セキュリティ（ユーザー存在有無の推測防止）                                                         |
| **Refresh Token**    | 実装済み（PR #301, #305） | アクセストークン期限切れ時に自動更新。`POST /auth/refresh` で取得し localStorage に保存            |

## レビュー結果

（レビュー後に記載）
