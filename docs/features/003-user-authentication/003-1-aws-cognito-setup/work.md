# AWS Cognito セットアップ

## 概要

Classical Music Lake で使用する AWS Cognito User Pool を作成・設定し、Lambda 関数から Cognito へアクセスするための権限設定を行う。

## スコープ

### 実装する内容

- AWS Cognito User Pool の作成（CDK で定義）
- User Pool の設定：
  - パスワードポリシー設定
  - メール送信設定（AWS SES との連携）
  - メール確認フロー設定
- App Client の作成（フロントエンドから使用）
- Lambda 関数に対する Cognito アクセス権限の付与（IAM ポリシー）

### 対象外

- ユーザープール管理（削除・編集）機能
- ソーシャルログイン設定

## 前提条件

- AWS CDK がプロジェクトに統合済み
- AWS SES のアカウントが利用可能

## テストケース

1. **Cognito User Pool が作成される**
   - CDK デプロイ後、AWS コンソールで User Pool が存在すること

2. **App Client が正しく設定されている**
   - App Client ID が環境変数として取得可能
   - Allow の OAuth フローが適切に設定されていること

3. **Lambda 関数が Cognito へアクセス可能**
   - Lambda 実行ロールに必要なアクション（例: `AdminGetUser`、`ListUsers`、`AdminUpdateUserAttributes`、`AdminDisableUser` 等）のみが付与されていること（最小権限の原則に従う）
   - IAM ロール確認で、付与されているアクション一覧・対象リソース ARN・ポリシーの適用状況が確認可能であること

4. **メール送信設定が有効**
   - User Pool がメール送信対象 SES を認識していること

## 依存関係

- なし（このタスク以降のタスクの基盤）
