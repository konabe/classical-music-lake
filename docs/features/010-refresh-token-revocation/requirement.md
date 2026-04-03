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

## 設計申し送りメモ

- Cognito の `RevokeToken` は Access Token ではなく Refresh Token を引数に取る
- `RevokeToken` 成功後、その Refresh Token から発行された Access Token は次のリクエスト検証時には通るが、新規発行はできなくなる（Access Token の自然失効 60 分を許容）
- `/auth/logout` は認証不要（Authorization ヘッダー不要）にしてよい。Refresh Token を本文で受け取るだけ
- Refresh Token が localStorage に存在しない場合（すでに削除済み等）はフロントエンドからエンドポイントを呼ばずにリダイレクトのみでよい
- Cognito App Client はシークレットなしのため、`RevokeToken` 呼び出し時に client_secret は不要
