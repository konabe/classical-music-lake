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

| シークレット名          | 説明                        |
| ----------------------- | --------------------------- |
| `AWS_ACCESS_KEY_ID`     | AWSアクセスキーID           |
| `AWS_SECRET_ACCESS_KEY` | AWSシークレットアクセスキー |

> `AWS_REGION` と `API_BASE_URL` はワークフロー内で自動取得するため不要。
> **⚠️ セキュリティ注意事項**: 長期 AWS アクセスキー（`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`）は常設シークレットとして管理しており、漏洩リスクが存在します。将来的には **GitHub OIDC + IAM AssumeRole** を使ったキーレス認証への移行を推奨します。

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
# <stage> には staging または prod を指定
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
