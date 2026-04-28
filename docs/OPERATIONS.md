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
  → Build frontend (pnpm run generate)
  → CDK Deploy
```

### 手動デプロイ

GitHub Actions の画面から「Run workflow」で手動トリガー可能。

### 初回セットアップ（CDK Bootstrap）

リポジトリ初回セットアップ時のみ必要：

```bash
cd cdk
pnpm install
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

```text
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

---

## 管理者ロール管理

Cognito User Pool には `admin` グループが存在する。グループへの追加・削除は AWS CLI またはコンソールで手動操作する。

> **重要**: 楽曲マスタ書き込み API（`POST /pieces` / `PUT /pieces/{id}` / `DELETE /pieces/{id}`）は `admin` グループ限定のため、グループが空のままでは誰も楽曲マスタを編集できない。新規環境へのデプロイ直後は、下記手順で初期管理者を付与すること（参照 API `GET /pieces` / `GET /pieces/{id}` は従来どおり公開で利用可）。

### User Pool ID の取得

```bash
# <stage> には dev, stg または prod を指定
STAGE=<stage>
STACK_NAME=$([ "$STAGE" = "prod" ] && echo "ClassicalMusicLakeStack" || echo "ClassicalMusicLakeStack-${STAGE}")

aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query 'Stacks[0].Outputs[?OutputKey==`CognitoUserPoolId`].OutputValue' \
  --output text
```

### 管理者の付与

```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <pool-id> \
  --username <email> \
  --group-name admin
```

### 管理者の剥奪

```bash
aws cognito-idp admin-remove-user-from-group \
  --user-pool-id <pool-id> \
  --username <email> \
  --group-name admin
```

### 特定ユーザーのグループ所属確認

```bash
aws cognito-idp admin-list-groups-for-user \
  --user-pool-id <pool-id> \
  --username <email>
```

### `admin` グループのメンバー一覧確認

```bash
aws cognito-idp list-users-in-group \
  --user-pool-id <pool-id> \
  --group-name admin
```

### トークンへの反映タイミング

グループの変更（付与・剥奪）は **再ログイン後** に ID Token の `cognito:groups` クレームへ反映される。変更直後の既存トークンには反映されない。

---

## Piece の composer 文字列 → composerId 移行手順

`Piece` の `composer: string`（自由入力）を `composerId: string`（Composer マスタへの UUID 参照）に置換する移行作業。既存データに対してのみ必要で、新規データは API 経由で直接 `composerId` 付きで作成される。

### 前提

- 移行 Lambda は**本番スタックから分離された `MigrationsStack[-<stage>]`** に所属する。ソースは `backend/src/migrations/piece-composer-id/index.ts`
- `MigrationsStack[-<stage>]` をデプロイすると `MigratePieceComposer` Lambda が作成される（API Gateway には接続されない）
- 対象テーブル: `classical-music-pieces[-<stage>]` / `classical-music-composers[-<stage>]`（`ClassicalMusicLakeStack[-<stage>]` 側で作成済みのものをテーブル名で参照）
- Lambda 名: `MigratePieceComposer`（CloudFormation リソース名。物理名は環境ごとに自動採番）
- 同時実行は `reservedConcurrentExecutions: 1` で 1 に制限されている
- 移行が完了したら `cdk destroy MigrationsStack[-<stage>]` でスタックごと破棄できる

### 実行手順（環境ごとに `dev → stg → prod` の順で実施）

#### 1. オンデマンドバックアップの取得（必須）

移行前にテーブルの現状を保存する：

```bash
STAGE=dev  # stg / prod
aws dynamodb create-backup \
  --table-name classical-music-pieces-${STAGE} \
  --backup-name "pre-composer-migration-$(date +%Y%m%d)"

aws dynamodb create-backup \
  --table-name classical-music-composers-${STAGE} \
  --backup-name "pre-composer-migration-$(date +%Y%m%d)"
```

> prod は `-<stage>` サフィックスなし（`classical-music-pieces` / `classical-music-composers`）。

#### 2. dry-run でログ確認

```bash
FUNC=$(aws lambda list-functions \
  --query "Functions[?contains(FunctionName, 'MigratePieceComposer')].FunctionName | [0]" \
  --output text)

aws lambda invoke \
  --function-name $FUNC \
  --payload '{"dryRun": true}' \
  --cli-binary-format raw-in-base64-out \
  /tmp/migrate-dry-run.json

cat /tmp/migrate-dry-run.json
```

CloudWatch Logs から:

- `migrated` / `createdComposers` / `skippedAlreadyMigrated` / `skippedNoComposer` のサマリを確認
- `would-create-composer` / `would-migrate` の各行を目視レビュー
- **表記揺れ**（例: 「ベートーヴェン」と「ベートーベン」）が検出された場合は、先に DynamoDB を手動で正規化してから本番実行に進む

#### 3. 本番モードで invoke

```bash
aws lambda invoke \
  --function-name $FUNC \
  --payload '{"dryRun": false}' \
  --cli-binary-format raw-in-base64-out \
  /tmp/migrate-run.json

cat /tmp/migrate-run.json
```

レスポンスの `migrated` 件数と期待値を突き合わせる。

#### 4. 再実行（べき等）

途中で失敗した場合は再度 `{"dryRun": false}` で invoke する。既に `composerId` を持つ Piece は自動 skip される（べき等）。

#### 5. 確認

- フロントエンド（各環境のドメイン）で楽曲一覧・詳細・編集画面を開き、作曲家名が正しく表示されることを確認
- DynamoDB 側で `composer` フィールドが残っていない（`composerId` のみになっている）ことを確認

### ロールバック

移行スクリプトに起因する問題があれば、手順 1 で取得したオンデマンドバックアップからテーブルを復元する：

```bash
aws dynamodb restore-table-from-backup \
  --target-table-name classical-music-pieces-${STAGE}-restored \
  --backup-arn <backup-arn>
```

復元は新しいテーブル名で行い、差分確認後に本番テーブル名へ差し替える（削除は慎重に）。

### デプロイとの順序関係

「本番スタックのデプロイで API が先に新スキーマ化される」→「移行 Lambda が走る前の旧データは composerId が無い」という窓が存在する。この窓では GET /pieces のレスポンスから `composer` が消える一方 `composerId` は空文字になるため、フロントエンドは `(不明な作曲家)` を表示する。窓を短くするため次の順で実施する：

1. `cdk deploy ClassicalMusicLakeStack[-<stage>]`（新 API スキーマを適用）
2. `cdk deploy MigrationsStack[-<stage>]`（移行 Lambda を作成）
3. オンデマンドバックアップ取得
4. 移行 Lambda を dry-run → 本番 invoke
5. S3 同期（フロント差し替え）
6. CloudFront invalidation
7. 移行完了確認後、任意のタイミングで `cdk destroy MigrationsStack[-<stage>]` でスタック破棄

---

## PR プレビュー環境

### 概要

PR ごとに独立した試験用 AWS 環境を立てて、レビュアーが本物の API Gateway + Lambda + DynamoDB に対して動作確認できる仕組み。フロントエンドはデプロイされず、API のみが対象。

| 項目             | 内容                                                                          |
| ---------------- | ----------------------------------------------------------------------------- |
| スタック名       | `ClassicalMusicLakeStack-pr-{PR番号}`（例: `ClassicalMusicLakeStack-pr-260`） |
| 含むリソース     | API Gateway + Lambda + DynamoDB（GSI 含む 4 テーブル）+ CloudWatch Alarms     |
| 含まないリソース | S3 / CloudFront / Route53 / ACM / 新規 Cognito User Pool / Storybook          |
| Cognito          | dev 環境の User Pool を参照（新規作成しない）                                 |
| 削除ポリシー     | 全テーブル DESTROY、空データ                                                  |
| CORS             | `*` で公開                                                                    |
| デプロイ時間     | 初回 2〜3 分、差分 30 秒〜2 分（フロント無しのため高速）                      |

### 利用方法

1. PR を作成
2. PR に **`preview` ラベル**を付与 → GitHub Actions が自動でプレビュー環境をデプロイ
3. デプロイ完了後、PR に Bot がコメントで API URL とログイン手順を投稿
4. レビュアーが dev フロントエンド（<https://dev.nocturne-app.com>）にログインして ID Token をブラウザの localStorage から取得
5. curl / Postman 等で API URL に対してリクエスト送信

```bash
# 公開 API
curl https://abc123.execute-api.ap-northeast-1.amazonaws.com/prod/pieces

# 認証必須 API
curl -H "Authorization: <ID_TOKEN>" \
  https://abc123.execute-api.ap-northeast-1.amazonaws.com/prod/listening-logs
```

### ライフサイクル

| イベント                                  | 動作                                |
| ----------------------------------------- | ----------------------------------- |
| `preview` ラベル付与（PR opened/labeled） | 初回デプロイ                        |
| ラベル付き PR への push（synchronize）    | 差分デプロイ（push のたびに自動）   |
| `preview` ラベル削除                      | 即時 destroy                        |
| PR クローズ                               | ラベル付きなら destroy              |
| 最終 deploy から 48h 経過                 | スケジュール cleanup で自動 destroy |

### 同時稼働の上限

ハード制限は無いが、稼働中の Preview スタックが **5 件以上**になると `preview-deploy.yml` が PR に警告コメントを投稿する。コストが気になる場合は不要な PR の `preview` ラベルを外して環境を片付けること。

### 初回セットアップ（リポジトリ管理者）

PR プレビュー機能を有効化するために、**1 度だけ**以下の手動オペレーションが必要。

#### 1. `preview` ラベルを作成

```bash
gh label create preview \
  --color 0e8a16 \
  --description "Deploy a preview AWS environment for this PR"
```

#### 2. `PreviewBudgetsStack` をデプロイ（コスト監視のため）

```bash
cd cdk
npx cdk deploy PreviewBudgetsStack
```

このスタックは **us-east-1** にデプロイされる（AWS Budgets はグローバルサービス）。月次予算 $20 USD を設定し、80% 実績超過 / 100% 予測超過時に `rt.konabe@gmail.com` にメール通知する。

#### 3. AWS Billing で `Preview` タグをコスト配分タグとして有効化

`PreviewBudgetsStack` のフィルタは「`Preview` タグが `true` のリソース」を見るが、AWS の制約でユーザータグをコスト管理に使うには手動アクティベートが必要（CDK 自動化不可）。

1. AWS Billing コンソール → 「Cost allocation tags」→ 「User-defined tags」タブ
2. `Preview` を検索してチェックボックスを選択
3. 「Activate」をクリック
4. 反映まで最大 24 時間かかる場合あり

### Cognito の扱い（重要）

Preview スタックは **dev 環境の Cognito User Pool を参照**するため:

- レビュアーは dev フロントエンドでログインして ID Token を取得する必要がある
- Preview 環境で作成した視聴ログ・コンサート記録は **dev Cognito ユーザーに紐づくが、データ自体は Preview 専用テーブル（`-pr-{番号}` サフィックス付き）に保存**される
- PR 環境を destroy するとデータも消える。dev 環境のデータには影響しない
- Preview 環境で `POST /pieces` などの管理者 API を叩く場合、dev の `admin` グループに属する ID Token が必要

### IAM 権限

`AWS_ROLE_TO_ASSUME` シークレットの IAM ロールに必要な権限は、通常デプロイで使うものと同種（`cloudformation:*` / `lambda:*` / `apigateway:*` / `dynamodb:*` / `iam:*Role*` / `logs:*` / `cloudwatch:*` 等）。Preview スタック専用の追加権限は不要。

ただし `PreviewBudgetsStack` をデプロイする際は **`budgets:CreateBudget` / `budgets:DescribeBudgets` / `budgets:ModifyBudget` / `budgets:DeleteBudget`** が必要。デプロイ時にエラーが出た場合は IAM ロールに追加すること。

### トラブルシューティング

#### preview-deploy が「dev スタック (ClassicalMusicLakeStack-dev) が稼働していない」で失敗する

dev スタックがダウンしているか、ロールバック中で Output が読めない。dev を再デプロイしてから再度 `preview` ラベルを付け直す。

#### preview-destroy が失敗する

CFN が `DELETE_FAILED` 状態になっている可能性。AWS コンソールで該当スタックを開き、削除をブロックしているリソース（保護されている DynamoDB テーブル等）を手動で削除してから `aws cloudformation delete-stack --stack-name ClassicalMusicLakeStack-pr-{番号}` を再実行する。

#### preview-cleanup が動いていない

GitHub Actions の Schedule トリガーは pulse の重い時間帯では遅延・スキップされることがある（公式ドキュメントに明記）。手動で `Preview Cleanup (48h idle)` ワークフローを `workflow_dispatch` から起動して掃除する。
