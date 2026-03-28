# 運用ドキュメント

## デプロイ手順

### 自動デプロイ（通常）

`main` ブランチへのプッシュで GitHub Actions が自動実行される。

```text
push to main
  → Install CDK dependencies
  → Configure AWS credentials
  → Get API Base URL from CloudFormation
  → Install frontend dependencies
  → Build frontend (npm run generate)
  → CDK Deploy
```

### 手動デプロイ

GitHub Actions の画面から「Run workflow」で手動トリガー可能。

### 初回セットアップ（CDK Bootstrap）

リポジトリ初回セットアップ時のみ必要：

```bash
cd cdk
npm install
cdk bootstrap aws://<AWS_ACCOUNT_ID>/ap-northeast-1
```

### 必要な GitHub Secrets

| シークレット名       | 説明                                          |
| -------------------- | --------------------------------------------- |
| `AWS_ROLE_TO_ASSUME` | GitHub OIDC で AssumeRole する IAM ロール ARN |

> `AWS_REGION` と `API_BASE_URL` はワークフロー内で自動取得するため不要。
> 認証方式は **GitHub OIDC + IAM AssumeRole** によるキーレス認証。長期 AWS アクセスキーは使用しない。

---

## ロールバック手順

### フロントエンドのロールバック

フロントエンドは S3 + CloudFront でホストされているため、古いコミットを `main` にリバートして再デプロイする：

```bash
# リバートコミットを作成
git revert <commit-hash>
git push origin main
# → GitHub Actions が自動デプロイ
```

### バックエンド（Lambda）のロールバック

CDK はステートフルなリソース（DynamoDB）は `RETAIN` ポリシーのため、Lambda のみロールバック可能：

```bash
cd cdk
git checkout <before-commit> -- lib/classical-music-lake-stack.ts
cdk deploy
```

### 緊急時：CDK スタックの確認

```bash
# <stage> には dev, stg または prod を指定
STAGE=<stage>
STACK_NAME=$([ "$STAGE" = "prod" ] && echo "ClassicalMusicLakeStack" || echo "ClassicalMusicLakeStack-${STAGE}")

aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query 'Stacks[0].StackStatus'
```

---

## 監視・アラート設定

### CloudWatch Logs

Lambda 関数のログは自動的に CloudWatch Logs に収集される。

| ロググループ                       | 内容               |
| ---------------------------------- | ------------------ |
| `/aws/lambda/ClassicalMusicLake-*` | 各Lambda関数のログ |

ログの確認：

```bash
aws logs tail /aws/lambda/ClassicalMusicLake-ListeningLogsCreate --follow
```

### 現在の監視設定

現時点では CloudWatch アラートは未設定（フェーズ2で整備予定）。

エラーは Lambda の `console.error` 出力で CloudWatch Logs に記録される。

### 推奨アラート（今後設定予定）

| メトリクス            | 閾値        | アクション |
| --------------------- | ----------- | ---------- |
| Lambda Errors         | 1件以上/5分 | メール通知 |
| API Gateway 5XX       | 1件以上/5分 | メール通知 |
| DynamoDB SystemErrors | 1件以上/5分 | メール通知 |

---

## バックアップ・リストア手順

### DynamoDB バックアップ

`ListeningLogs` テーブルの削除ポリシーは `RETAIN`（スタック削除時もテーブルを保持）。

#### オンデマンドバックアップの作成

```bash
aws dynamodb create-backup \
  --table-name classical-music-listening-logs \
  --backup-name "manual-backup-$(date +%Y%m%d)"
```

#### バックアップ一覧の確認

```bash
aws dynamodb list-backups \
  --table-name classical-music-listening-logs
```

#### バックアップからのリストア

```bash
aws dynamodb restore-table-from-backup \
  --target-table-name classical-music-listening-logs-restored \
  --backup-arn <backup-arn>
```

### ポイントインタイムリカバリ（PITR）

現時点では PITR は未設定。必要に応じて CDK スタックで有効化できる：

```typescript
// cdk/lib/classical-music-lake-stack.ts
pointInTimeRecovery: true;
```

### データのエクスポート（手動）

```bash
aws dynamodb scan \
  --table-name classical-music-listening-logs \
  --output json > backup-$(date +%Y%m%d).json
```

---

## Cognito ユーザー管理

### User Pool 情報の確認

デプロイ後、CDK の Output で Cognito User Pool ID と App Client ID が表示される：

```
CognitoUserPoolId = <pool-id>
CognitoClientId = <client-id>
CognitoUserPoolArn = arn:aws:cognito-idp:ap-northeast-1:xxxxx:userpool/<pool-id>
```

### ユーザー登録

フロントエンドの登録フォームを通じて、ユーザーが自己登録可能（`selfSignUpEnabled: true`）。

メール確認フローは自動実行される（Cognito が SES でメール送信）。

### ユーザーの手動管理（管理者向け）

特定ユーザーの削除や属性更新は AWS Cognito コンソール または AWS CLI から：

```bash
# ユーザー削除
aws cognito-idp admin-delete-user \
  --user-pool-id <pool-id> \
  --username <email>

# ユーザー属性更新
aws cognito-idp admin-update-user-attributes \
  --user-pool-id <pool-id> \
  --username <email> \
  --user-attributes Name=email_verified,Value=true
```

### ログアウト動作

ログアウトはクライアント側のみで処理される（JWT はステートレスのため、サーバー側セッション無効化は行わない）。

- ナビゲーションバーの「ログアウト」ボタン押下で `localStorage` から `accessToken` を削除
- 削除後、`/auth/login` へ自動リダイレクト
- Access Token の残り有効期間中（最大 60 分）は、直接 API を叩けば認証が通る状態になるが、MVP フェーズではこの制約を許容する

> 将来フェーズで Token Blacklist または Refresh Token の無効化が必要な場合は、バックエンドの logout エンドポイントを追加する。

### トークン設定

- Access Token TTL: 60 分
- ID Token TTL: 60 分
- Refresh Token TTL: 30 日

### セキュリティ設定

- パスワード最小文字数: 8 文字
- 大文字・小文字・数字を必須
- アカウントロックアウト: 5 回失敗で 15 分ロック
- メール確認: 必須
