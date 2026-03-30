# 004-001 認証コード入力画面・登録後の自動遷移 - 設計

## 概要

ユーザー登録完了後に認証コード入力画面へ自動遷移し、メールで受け取った認証コードを入力・検証する。
コードが正しければ自動ログイン、誤りや期限切れの場合はエラーを表示し、再送信ボタンからコードを再発行できる。

---

## バックエンド設計

### 新規 Lambda 関数

#### `POST /auth/verify-email` — 認証コード確認

- **ファイル**: `backend/src/auth/verify-email.ts`
- **Cognito API**: `ConfirmSignUpCommand`
- **リクエストボディ**: `{ email: string; code: string }`
- **レスポンス**:
  - 成功 (200): `{ message: string }`
  - 失敗 (400): `{ error: "CodeMismatch" | "ExpiredCode", message: string }`
  - 失敗 (400): `{ error: "NotAuthorizedException", message: string }` （既確認済み等）
  - 失敗 (429): `{ error: "TooManyRequests", message: string }`

**備考**: ConfirmSignUp 後の自動ログインはフロントエンドが既存の `/auth/login` を呼び出すことで実現する。そのため、このエンドポイントはトークンを返さない。

#### `POST /auth/resend-verification-code` — 認証コード再送信

- **ファイル**: `backend/src/auth/resend-verification-code.ts`
- **Cognito API**: `ResendConfirmationCodeCommand`
- **リクエストボディ**: `{ email: string }`
- **レスポンス**:
  - 成功 (200): `{ message: string }`
  - 失敗 (400): `{ error: "UserAlreadyConfirmed", message: string }`
  - 失敗 (429): `{ error: "TooManyRequests", message: string }`

### CDK への追加

- `authVerifyEmail` Lambda に `cognito-idp:ConfirmSignUp` の IAM 権限を付与
- `authResendCode` Lambda に `cognito-idp:ResendConfirmationCode` の IAM 権限を付与
- API Gateway に `/auth/verify-email (POST)` と `/auth/resend-verification-code (POST)` ルートを追加
- 両エンドポイントに CORS 設定を追加（認証不要）

---

## フロントエンド設計

### 画面遷移フロー

```text
ユーザー登録フォーム送信
        ↓ 成功
verify-email ページへリダイレクト
（ナビゲーションステートに email・password を渡す）
        ↓ 認証コード入力・送信
POST /auth/verify-email で確認
        ↓ 成功
POST /auth/login で自動ログイン
        ↓ 成功
ホーム画面へ遷移
```

**ナビゲーションステートの利用理由**: パスワードを URL クエリパラメータに含めないためにナビゲーションステートを使用する。

### 新規ページ

#### `app/pages/auth/verify-email.vue`

- レイアウト: `auth`
- ナビゲーションステートから `email`・`password` を取得する
  - ステートが存在しない場合は登録ページへリダイレクト
- `VerifyEmailTemplate` コンポーネントを使用

### 新規コンポーネント（Atomic Design に従う）

#### Template: `app/components/templates/VerifyEmailTemplate.vue`

- Props: `email`, `isLoading`, `errors`, `infoMessage`
- Emits: `submit(code: string)`, `resend()`
- `VerifyEmailForm` Organism を内包する

#### Organism: `app/components/organisms/VerifyEmailForm.vue`

- **表示内容**:
  - 登録したメールアドレスの表示（編集不可）
  - 認証コード入力フィールド（数値 6 桁）
  - 「確認する」送信ボタン
  - 「再送信」ボタン
  - エラーメッセージ表示エリア（`ErrorMessage` Atom を利用）
  - 案内メッセージ表示エリア（再送信成功時等）

### 既存ファイルの変更

#### `app/pages/auth/user-register.vue`

- 登録成功時の処理を変更:
  - 現在: `successMessage` にメッセージをセット
  - 変更後: `router.push('/auth/verify-email', { state: { email, password } })` でリダイレクト

#### `app/composables/useAuth.ts`

- `verifyEmail(email: string, code: string): Promise<VerifyEmailResult>` を追加
  - `POST /auth/verify-email` を呼び出す
- `resendVerificationCode(email: string): Promise<ResendCodeResult>` を追加
  - `POST /auth/resend-verification-code` を呼び出す

### 型定義の追加

#### `app/composables/useAuth.ts` 内に追加

```text
VerifyEmailResult:
  success: boolean
  error?: string
  errorType?: "code_mismatch" | "expired_code" | "already_confirmed" | "general"

ResendCodeResult:
  success: boolean
  error?: string
```

---

## エラーハンドリング方針

| エラー種別                       | 表示メッセージ                                         |
| -------------------------------- | ------------------------------------------------------ |
| CodeMismatch                     | 認証コードが正しくありません                           |
| ExpiredCode                      | 認証コードの有効期限が切れています。再送信してください |
| UserAlreadyConfirmed（再送信時） | このアカウントは既に確認済みです                       |
| TooManyRequests                  | しばらく時間をおいてから再試行してください             |
| その他                           | 予期しないエラーが発生しました                         |

---

## レビュー結果

<!-- レビュアーはここにレビュー結果を記載してください -->
