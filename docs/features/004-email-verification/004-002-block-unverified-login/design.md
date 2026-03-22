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

変更方針：エラーメッセージ表示ではなく、`/auth/verify-email` へリダイレクトする。

#### verify-email.vue（変更対象）

現状：ページ遷移元が「新規登録フロー」のみを想定した実装になっている。

- `history.state.email` がない、または `sessionStorage` に `pendingPassword` がない場合は `/auth/user-register` へ強制リダイレクト
- メール確認後に `pendingPassword` を使った自動ログインを行う

変更方針：「ログインフロー経由」のケースを追加で扱えるようにする。

---

## 設計方針

### ページ遷移フロー

```
[ログイン画面]
  ↓ メール未確認エラー (errorType === "not_confirmed")
  ↓ router.push("/auth/verify-email", { state: { email, fromLogin: true } })
[メール確認画面]
  ↓ 確認成功
  ↓ router.push("/auth/login", { state: { verified: true } })
[ログイン画面]
  ↓ 確認完了メッセージを表示
```

### 遷移元の判定方法

`verify-email.vue` では `history.state` の内容により遷移元フローを判定する。

| 遷移元 | history.state の内容 | sessionStorage |
|--------|---------------------|----------------|
| 新規登録フロー | `{ email }` | `pendingPassword` あり |
| ログインフロー | `{ email, fromLogin: true }` | `pendingPassword` なし |

### verify-email.vue のガード条件変更

現状：`email` も `pendingPassword` もない場合のみ `/auth/user-register` へリダイレクト。

変更後：
- `email` がない → `/auth/user-register` へリダイレクト（変更なし）
- `pendingPassword` がない かつ `fromLogin` が `true` でない → `/auth/user-register` へリダイレクト
- `pendingPassword` がない かつ `fromLogin` が `true` → ログインフロー経由として正常処理

### 確認成功後の動作変更

| 遷移元 | 確認成功後の動作 |
|--------|----------------|
| 新規登録フロー | 自動ログイン → トップページへ（現状維持） |
| ログインフロー | ログイン画面へリダイレクト（`verified: true` を state で渡す） |

### login.vue での確認完了メッセージ表示

`onMounted` で `history.state.verified` が `true` の場合、メール確認完了の案内メッセージを表示する。

---

## 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `app/pages/auth/login.vue` | `not_confirmed` エラー時のリダイレクト処理追加、確認完了メッセージ表示追加 |
| `app/pages/auth/verify-email.vue` | ガード条件の緩和、ログインフロー経由の確認成功後処理追加 |

---

## レビュー結果

<!-- レビュー後にここに記載してください -->
