# 011-01 Google OAuth 認証

## 概要

Cognito Hosted UI 経由で Google OAuth 2.0 認証を実装する。

## 実装内容

- `useCognitoConfig` composable 新設（Cognito ドメイン・クライアント ID の取得）
- `useAuth` に `loginWithGoogle` / `handleOAuthCallback` を追加
- `LoginForm` / `LoginTemplate` / `login.vue` に「Google でログイン」ボタンを追加
- `/auth/callback` ページ新設（認可コードをトークンに交換）
- CDK: `UserPoolIdentityProviderGoogle`・Cognito Hosted UI ドメイン・App Client コールバック URL を追加
- `nuxt.config.ts` に `cognitoDomain` / `cognitoClientId` を追加

## 備考

Google IdP は GitHub Secrets の `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` が設定済みの場合のみ CDK が作成する。
