# ユーザー登録 - 設計書

## 概要

フロントエンドの登録フォーム、バックエンド Lambda、Cognito を連携させて新規ユーザー登録機能を実装する。

## システムフロー

```text
ユーザー入力
    ↓
[登録フォーム (Nuxt)]
    - メール入力
    - パスワード入力
    - バリデーション（クライアント側）
    ↓
POST /auth/register
    ↓
[Lambda: register.ts]
    - リクエスト検証
    - Cognito へ登録（SignUp API）
    ↓
AWS Cognito User Pool
    - ユーザー作成
    - メール確認用トークン生成
    - SES でメール送信
    ↓
成功レスポンス返却
    ↓
[フロントエンド]
    - 成功メッセージ表示
    - ログイン画面へのリンク提示
```

## フロントエンド設計

### ページ・コンポーネント

- **ページ**: `pages/auth/register.vue`
  - 登録フォーム（`<input type="email">`, `<input type="password">`）
  - 登録ボタン、ログイン画面へのリンク

- **Composable**: `composables/useAuth.ts`（または `useRegister.ts`）
  - API 呼び出しロジック
  - バリデーション（クライアント側）
  - エラーハンドリング

### バリデーション（クライアント側）

| フィールド     | ルール                               | エラーメッセージ                                                      |
| -------------- | ------------------------------------ | --------------------------------------------------------------------- |
| **メール**     | 形式チェック（RFC 5322）             | 「有効なメールアドレスを入力してください」                            |
| **パスワード** | 8 字以上、大文字 1、小文字 1、数字 1 | 「パスワードは 8 字以上で、大文字・小文字・数字を含む必要があります」 |

> バリデーションルール・エラーメッセージはフロントエンド（クライアント側バリデーション）とバックエンド（Lambda のリクエスト検証）で同一のルールを使用し、ユーザーへの表示メッセージも統一する。

### UI フロー

1. ユーザーが登録フォームにアクセス
2. メール・パスワード入力
3. 登録ボタン押下 → クライアント側バリデーション
4. API 呼び出し（ローディング表示）
5. **成功時**: 「確認メールを送信しました。メールをご確認ください。」を表示、ログイン画面へのリンク
6. **エラー時**: エラーメッセージ表示（例: 「このメールアドレスは既に登録されています」）

### トークン管理

- 登録時はトークン不要（未認証ユーザー）

## バックエンド設計

### エンドポイント

```http
POST /auth/register
Content-Type: application/json

リクエスト:
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

レスポンス (201 Created):
{
  "message": "User created successfully. Please check your email to verify your account."
}

レスポンス (400 Bad Request):
{
  "error": "UserExists",
  "message": "An account with the given email already exists."
}

レスポンス (400 Bad Request):
{
  "error": "InvalidPassword",
  "message": "Password does not meet the requirements."
}
```

### Lambda 関数: `backend/src/auth/register.ts`

#### 処理フロー

1. **リクエスト検証**
   - `email`, `password` の存在確認
   - メール形式チェック（簡易版、Cognito が詳細チェック）
   - パスワード要件チェック

2. **Cognito へのユーザー登録**
   - `CognitoIdentityServiceProvider.SignUp()` を呼び出し
   - メール確認フロー開始

3. **レスポンス返却**
   - 成功: 201 Created, メッセージ返却
   - エラー: 適切なステータスコードとエラーメッセージ

#### エラーハンドリング

| Cognito エラー             | HTTP ステータス           | レスポンス                                     |
| -------------------------- | ------------------------- | ---------------------------------------------- |
| `UserExistsException`      | 400 Bad Request           | `{ error: "UserExists", message: "..." }`      |
| `InvalidPasswordException` | 400 Bad Request           | `{ error: "InvalidPassword", message: "..." }` |
| `TooManyRequestsException` | 429 Too Many Requests     | `{ error: "TooManyRequests", message: "..." }` |
| その他                     | 500 Internal Server Error | `{ error: "InternalError", message: "..." }`   |

### DynamoDB スキーマ

- Cognito が自動管理するため、別途実装なし

## セキュリティ考慮事項

### 実装予定

- HTTPS のみ（本番環境）
- パスワード複雑性要件（8 字以上、大小文字・数字を含む）
- Rate Limiting（登録: 5 req/min）

### 実装しない

- Honeypot フィールド（MVPでは不要）
- CAPTCHA（将来フェーズ）

## トレードオフ・判断理由

| 項目                             | 選択                      | 理由                                                     |
| -------------------------------- | ------------------------- | -------------------------------------------------------- |
| **メール確認フロー**             | 自動メール送信（Cognito） | Cognito の標準機能を活用、実装負荷軽減                   |
| **パスワード管理**               | Cognito に委譲            | セキュリティベストプラクティス、暗号化・レート制限が無料 |
| **クライアント側バリデーション** | 実装                      | UX 向上、サーバー負荷軽減                                |

## レビュー結果

（レビュー後に記載）
