# Refresh Token 無効化（ログアウト時トークン失効） - 要件定義

## 概要

ログアウト時に Cognito の `RevokeToken` API を呼び出し、Refresh Token をサーバー側で即時無効化する。
これにより、ログアウト後に Refresh Token を使った新しいトークン取得を防ぐ。

## 目的

現在のログアウトはクライアント側のトークン削除のみで、Refresh Token がサーバー側で有効なままとなっている。
ログアウト後に Refresh Token が悪用されるリスクを排除する。

## 機能スコープ

### 実装する機能

- バックエンドに `POST /auth/logout` エンドポイントを追加する
  - リクエストで Refresh Token を受け取り、Cognito `RevokeToken` を呼び出す
  - Cognito 側で Refresh Token を即時無効化する
- フロントエンドのログアウト処理を更新する
  - localStorage の Refresh Token を `POST /auth/logout` に送信してから削除する
  - 既存の `localStorage` クリア・リダイレクト処理は維持する

### 実装しない機能（将来の実装対象）

- Access Token の即時無効化（GlobalSignOut による全トークン無効化）
- 他デバイスへの強制ログアウト連携
- Token Blacklist（独自 DB によるトークン管理）

## 関連ADR

- [ADR-002: ログアウト時に GlobalSignOut による全トークン即時無効化を行わない](../../adr/002-no-global-sign-out.md)
