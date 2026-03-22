# 004-002 未確認ユーザーのログイン制御 設計書

## 現状分析

### バックエンド（login.ts）

既に `UserNotConfirmedException` を処理済み。

- HTTP 403 / `error: "UserNotConfirmed"` を返す実装が完成している
- **変更不要**

### フロントエンド

#### useAuth.ts

`login()` 関数の戻り値にて `errorType: "not_confirmed"` を返す実装が完成している。

- **変更不要**

#### login.vue（変更対象）

現状：`errorType === "not_confirmed"` のとき、画面にエラーメッセージを表示するのみ。

変更方針：エラーメッセージ表示ではなく、入力中のパスワードを `sessionStorage` の `pendingPassword` に保存したうえで `/auth/verify-email` へリダイレクトする。

#### verify-email.vue（変更対象）

現状：ページ遷移元が「新規登録フロー」のみを想定した実装になっている。

- `history.state.email` がない、または `sessionStorage` に `pendingPassword` がない場合は `/auth/user-register` へ強制リダイレクト
- メール確認後に `pendingPassword` を使った自動ログインを行う

変更方針：ログインフロー経由でも同様に `pendingPassword` を利用するため、ガード条件・確認成功後処理を変更不要とする。

---

## 設計方針

### ページ遷移フロー

```
[ログイン画面]
  ↓ メール未確認エラー (errorType === "not_confirmed")
  ↓ sessionStorage に pendingPassword を保存
  ↓ router.push("/auth/verify-email", { state: { email } })
[メール確認画面]
  ↓ 確認成功
  ↓ pendingPassword を使って自動ログイン → トップページへ（新規登録フローと同一）
```

### 遷移元の判定方法

両フローとも `sessionStorage` に `pendingPassword` を保存するため、`verify-email.vue` での遷移元判定は不要。

| 遷移元         | history.state の内容 | sessionStorage         |
| -------------- | -------------------- | ---------------------- |
| 新規登録フロー | `{ email }`          | `pendingPassword` あり |
| ログインフロー | `{ email }`          | `pendingPassword` あり |

### verify-email.vue のガード条件

変更なし。`email` も `pendingPassword` もない場合のみ `/auth/user-register` へリダイレクト。

### 確認成功後の動作

両フロー共通：自動ログイン → トップページへ。

---

## 変更対象ファイル

| ファイル                   | 変更内容                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `app/pages/auth/login.vue` | `not_confirmed` エラー時に `pendingPassword` を sessionStorage に保存してからリダイレクト処理追加 |

---

## レビュー結果

<!-- レビュー後にここに記載してください -->
