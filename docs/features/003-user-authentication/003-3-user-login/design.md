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
    - アクセストークンを localStorage に保存（短寿命: 60 分）
    - リフレッシュトークンを HttpOnly Secure Cookie に保存
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

**採用**: **アクセストークンは localStorage、リフレッシュトークンは HttpOnly Secure Cookie**

- アクセストークン: XSS リスクを最小化するため短寿命（60 分）で localStorage に保存
- リフレッシュトークン: HttpOnly・Secure・SameSite=Strict の Cookie に保存（JS からアクセス不可）

### トークン管理の実装方針

- アクセストークンを `localStorage` に保存（短寿命: 60 分）
- リフレッシュトークンを HttpOnly Secure Cookie（SameSite=Strict）に保存
- API 呼び出し時のトークン自動付加: **`composables/useApiBase.ts`** ラッパーを通じて一元管理
  - `usePieces.ts` や `useListeningLogs.ts` など各 composable は `useApiBase` 経由でリクエストを送信
  - `useApiBase` が localStorage からアクセストークンを読み取り `Authorization: Bearer {token}` を付加
  - Nuxt Plugin / ミドルウェアでのグローバルインターセプターは使用しない
- ログアウト時: localStorage のアクセストークン削除 + Cookie のリフレッシュトークンを削除（`Set-Cookie: Max-Age=0`）
- トークン有効期限管理（Refresh Token の自動更新は後フェーズで実装予定）

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
- リフレッシュトークンの自動更新（将来フェーズ）

### 実装しない

- 多要素認証（将来フェーズ）
- ロックアウト後の復旧 UI（Cognito が自動管理）

## トレードオフ・判断理由

| 項目                 | 選択                 | 理由                                                |
| -------------------- | -------------------- | --------------------------------------------------- |
| **認証フロー**       | USER_PASSWORD_AUTH   | シンプル、Cognito 標準                              |
| **トークン保存**     | localStorage         | MVP での実装速度優先。将来 Secure Cookie へ移行可能 |
| **エラーメッセージ** | 汎用化               | セキュリティ（ユーザー存在有無の推測防止）          |
| **Refresh Token**    | 実装しない（初期版） | MVP スコープ削減。トークン有効期限 60 分で対応      |

## レビュー結果

（レビュー後に記載）
