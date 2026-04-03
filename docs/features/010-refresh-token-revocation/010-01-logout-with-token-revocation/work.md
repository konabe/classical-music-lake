# 010-01: ログアウト時の Refresh Token 無効化

## 概要

ログアウト時にバックエンドで Cognito `RevokeToken` を呼び出し、Refresh Token をサーバー側で即時無効化する。
フロントエンドはログアウトボタン押下時に `POST /auth/logout` を呼び出してから既存のクリア・リダイレクト処理を行う。

## ユーザーストーリー

ユーザーとして、ログアウトしたときに自分の Refresh Token がサーバー側でも無効化されることで、
トークンの悪用リスクなく安全にログアウトできる。

## 受入テストケース

### 正常系

1. ログイン済み状態でログアウトボタンを押すと、`POST /auth/logout` が呼び出される
2. `POST /auth/logout` 呼び出し後、localStorage から全トークン（accessToken・idToken・refreshToken）が削除される
3. ログアウト後、`/auth/login` にリダイレクトされる
4. ログアウト後、無効化された Refresh Token で `POST /auth/refresh` を呼び出すと `401` が返る

### 異常系

5. Refresh Token が localStorage に存在しない状態でログアウトした場合、`POST /auth/logout` を呼ばずにトークン削除・リダイレクトのみ行われる
6. `POST /auth/logout` がネットワークエラー等で失敗した場合でも、localStorage のクリアとリダイレクトは実行される（エラーを握りつぶす）
7. `POST /auth/logout` に無効な Refresh Token を送信した場合、`400` が返る
