# AWS Cognito セットアップ - 設計書

## 概要

Classical Music Lake 用の AWS Cognito User Pool と App Client を CDK で定義し、デプロイする。

## システム構成

```text
Nuxt フロントエンド
        ↓
    (JWT トークン)
        ↓
   API Gateway
        ↓
Lambda 関数
        ↓
AWS Cognito User Pool
        ↓
    DynamoDB (ユーザー情報)
```

## Cognito User Pool 設定

### ユーザー属性

- **Email**: サインイン時のプライマリ属性
- **Email_verified**: メール確認フロー用
- **sub**: OpenID Connect 仕様に基づく Cognito の標準（予約済み）属性であり、Cognito が自動採番する。カスタム属性として定義することはできない

### パスワードポリシー

- 最小文字数: 8 文字
- 大文字: 1 字以上
- 小文字: 1 字以上
- 数字: 1 字以上
- 特殊文字: 不要（ユーザー利便性を優先）

### メール設定

- **Email Verification**: 必須（ユーザー登録後に確認メール送信）
- **Mail From**: AWS SES で認証済みのメールアドレス（例: noreply@classical-music-lake.example.com）
- **MFA**: 無効（将来フェーズで実装予定）

### アカウントロックアウト

- 不正ログイン試行: 5 回で一時的にロック
- ロック期間: 15 分

## App Client 設定

### OAuth フロー

- **Authorization Code Flow**: フロントエンドから使用
- **Implicit Flow**: 使用しない（セキュリティ考慮）
- **管理用 Lambda からの Cognito 管理 API 呼び出し**: Client Credentials Flow は使用しない。管理用 Lambda から Cognito 管理 API（AdminGetUser 等）を呼び出す場合は、Lambda 実行ロールに付与した IAM ロールを使用する。なお、Client Credentials Flow は M2M 通信やカスタムスコープ付きトークン取得向けであり、管理操作（ユーザー管理 API の呼び出し）には適していない

### トークン設定

- **Access Token TTL**: 60 分
- **Refresh Token TTL**: 30 日
- **ID Token TTL**: 60 分

### Callback URL / Logout URL

- Callback URL: `https://classical-music-lake.example.com/auth/callback`
- Logout URL: `https://classical-music-lake.example.com/login`

## Lambda 権限設定

### IAM ポリシー

- Lambda 実行ロールには最小権限の原則に従い、必要なアクションのみを付与する
- 付与するアクション:
  - `cognito-idp:AdminGetUser`
  - `cognito-idp:AdminUpdateUserAttributes`
  - `cognito-idp:AdminCreateUser`
  - `cognito-idp:AdminDeleteUser`
  - `cognito-idp:ListUsers`
- リソース: 特定の User Pool ARN のみに限定する（例: `arn:aws:cognito-idp:{region}:{account-id}:userpool/{user-pool-id}`）

### API Gateway との連携

- Authorizer: Cognito User Pool を使用
- 認可失敗時: 401 Unauthorized

## セキュリティ考慮事項

### 実装予定

- HTTPS のみ（本番環境）
- CORS: API ドメインのみ許可
- Rate Limiting: API Gateway で実装（ログイン/登録は 5 req/min）

### 実装しない

- WAF（将来フェーズ）
- 追加の MFA（将来フェーズ）

## トレードオフ・判断理由

| 項目                              | 選択             | 理由                                                                                                               |
| --------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Email vs Username**             | Email            | ユーザーフレンドリー、一意性が保証される                                                                           |
| **自前実装 vs Cognito Hosted UI** | カスタムフォーム | UI/UX の完全制御、既存デザインとの統一                                                                             |
| **管理用 Lambda の Cognito 操作** | IAM ロール使用   | 管理 API 呼び出しには IAM ロールが適切。Client Credentials Flow は M2M・カスタムスコープ向けであり管理操作には不適 |
| **Refresh Token TTL**             | 30 日            | セッション持続性と セキュリティのバランス                                                                          |

## レビュー結果

（レビュー後に記載）
