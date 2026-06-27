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
# <stage> には stg または prod を指定
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

### CloudWatch アラート

CDK で各環境に CloudWatch アラートを定義済み（`cdk/lib/classical-music-lake-stack.ts`）。アラート発火時の通知先は SNS トピック `classical-music-lake-<stage>-alerts` 経由でメール送信される。コスト優先でアラームを集約方式に間引いており、**prod は 5 アラーム / stg は 4 アラーム**構成。stg / prod は同一 AWS アカウントを共有するため、リソース紐付けのメトリクス（API Gateway / DynamoDB）は各スタックごとに作成し、Lambda エラーはアカウント全体集約として prod スタックにのみ作成する。

**prod（計 5 個）**

| アラーム名                                       | メトリクス                                                      | 閾値                           | 通知先             |
| ------------------------------------------------ | --------------------------------------------------------------- | ------------------------------ | ------------------ |
| `classical-music-lake-lambda-errors`             | `AWS/Lambda` `Errors`（ディメンションなし、アカウント全体集約） | 1 件以上 / 5 分                | SNS Topic → メール |
| `classical-music-lake-prod-api-5xx`              | API Gateway 5XX                                                 | 1 件以上 / 5 分                | SNS Topic → メール |
| `classical-music-lake-prod-api-latency-p99`      | API Gateway Latency (p99)                                       | 3,000ms 超 / 5 分 × 2 期間連続 | SNS Topic → メール |
| `classical-music-lake-prod-dynamo-throttle`      | DynamoDB `ThrottledRequests`（MathExpression で 4 表合算）      | 1 件以上 / 5 分                | SNS Topic → メール |
| `classical-music-lake-prod-dynamo-system-errors` | DynamoDB `SystemErrors`（MathExpression で 4 表合算）           | 1 件以上 / 5 分                | SNS Topic → メール |

**stg（計 4 個）**

| アラーム名                                      | メトリクス                                                 | 閾値                           | 通知先             |
| ----------------------------------------------- | ---------------------------------------------------------- | ------------------------------ | ------------------ |
| `classical-music-lake-stg-api-5xx`              | API Gateway 5XX                                            | 1 件以上 / 5 分                | SNS Topic → メール |
| `classical-music-lake-stg-api-latency-p99`      | API Gateway Latency (p99)                                  | 3,000ms 超 / 5 分 × 2 期間連続 | SNS Topic → メール |
| `classical-music-lake-stg-dynamo-throttle`      | DynamoDB `ThrottledRequests`（MathExpression で 4 表合算） | 1 件以上 / 5 分                | SNS Topic → メール |
| `classical-music-lake-stg-dynamo-system-errors` | DynamoDB `SystemErrors`（MathExpression で 4 表合算）      | 1 件以上 / 5 分                | SNS Topic → メール |

> Lambda エラーは prod のアカウント全体集約アラーム（ディメンションなしの `AWS/Lambda` `Errors`）が stg / prod 双方の関数を捕捉するため、stg 専用のものは作らない。
>
> 各アラームは ALARM 状態と OK 状態の両方で SNS にイベントを送信する。
>
> コスト削減のため X-Ray トレーシングは Lambda / API Gateway とも無効化し、CloudWatch Logs（Lambda 各ロググループ・API Gateway アクセスログ）の保持期間は 1 ヶ月に短縮している（アクセスログ自体は維持）。
>
> 旧構成は Lambda 関数ごと約 29 個 + DynamoDB テーブルごと 8 個 + API 2 個 = 各環境約 39 アラームだった。

#### 通知先メールアドレスの設定

CDK デプロイ時に `ALERT_EMAIL` 環境変数（カンマ区切りで複数指定可）を渡すと、SNS トピックにメール購読が作成される。GitHub Actions では `ALERT_EMAIL` シークレットを参照する。

```bash
# ローカルからのデプロイ例
ALERT_EMAIL="ops@example.com,oncall@example.com" \
STAGE_NAME=stg \
npx cdk deploy ClassicalMusicLakeStack-stg
```

未設定でも SNS トピック自体は作成されるため、後から AWS コンソールまたは CLI で購読を追加できる：

```bash
TOPIC_ARN=$(aws cloudformation describe-stacks \
  --stack-name ClassicalMusicLakeStack-stg \
  --query 'Stacks[0].Outputs[?OutputKey==`AlertTopicArn`].OutputValue' \
  --output text)

aws sns subscribe \
  --topic-arn "$TOPIC_ARN" \
  --protocol email \
  --notification-endpoint ops@example.com
```

メール購読は購読確認メール内のリンクをクリックして承認するまで `PendingConfirmation` 状態となる。

#### アラート停止（一時的）

メンテナンス等で通知を一時停止したい場合、AWS コンソールから対象アラームのアクションを無効化するか、CLI で実施する：

```bash
aws cloudwatch disable-alarm-actions \
  --alarm-names classical-music-lake-stg-api-5xx
```

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
# <stage> には stg または prod を指定
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

## Piece の `kind` バックフィル移行手順

楽曲マスタを Composite モデル（Work / Movement）に再設計（PR1）するより前に作成された `Piece` レコードは `kind` フィールドを持たない。読み込み時には `DynamoDBPieceRepository` が `kind: "work"` を補完するため API レスポンスは正常だが、永続化されたデータ自体を正規化することで透過的な互換ロジックを将来削除可能にする。

### 前提

- 移行 Lambda は `MigrationsStack[-<stage>]` に所属する。ソースは `backend/src/migrations/piece-kind-backfill/index.ts`
- `MigrationsStack[-<stage>]` をデプロイすると `MigratePieceKindBackfill` Lambda が作成される（API Gateway には接続されない）
- 対象テーブル: `classical-music-pieces[-<stage>]`（`ClassicalMusicLakeStack[-<stage>]` 側で作成済みのものをテーブル名で参照）
- IAM は piecesTable のみ。`reservedConcurrentExecutions: 1` で同時実行禁止
- 依存関係: PR2（`parentId-index-index` GSI 追加）のデプロイが各環境に伝播済みであること（GSI バックフィルが走るとテーブルへの書き込み I/O が一時的に上がるため、移行は GSI が ACTIVE になってから実施する）
- **べき等**: `kind` が既に `"work"` または `"movement"` のレコードは skip される。何度実行しても安全

### 実行手順（環境ごとに `stg → prod` の順で実施）

> 推奨スパン: stg で実行 → 1 週間後に prod。各段で問題が無いことを確認してから次の環境へ進む。

#### 1. オンデマンドバックアップの取得（必須）

```bash
STAGE=stg  # stg / prod
aws dynamodb create-backup \
  --table-name classical-music-pieces-${STAGE} \
  --backup-name "pre-kind-backfill-$(date +%Y%m%d)"
```

> prod は `-<stage>` サフィックスなし（`classical-music-pieces`）。

#### 2. dry-run でログ確認

```bash
FUNC=$(aws lambda list-functions \
  --query "Functions[?contains(FunctionName, 'MigratePieceKindBackfill')].FunctionName | [0]" \
  --output text)

aws lambda invoke \
  --function-name $FUNC \
  --payload '{"dryRun": true}' \
  --cli-binary-format raw-in-base64-out \
  /tmp/kind-backfill-dry-run.json

cat /tmp/kind-backfill-dry-run.json
```

CloudWatch Logs から:

- `total` / `backfilled` / `skippedAlreadyKind` のサマリを確認
- `would-backfill-kind` の各行を目視レビュー（`pieceId` のサンプリング確認）
- 想定件数と乖離があれば次の手順に進まない

#### 3. 本番モードで invoke

```bash
aws lambda invoke \
  --function-name $FUNC \
  --payload '{"dryRun": false}' \
  --cli-binary-format raw-in-base64-out \
  /tmp/kind-backfill-run.json

cat /tmp/kind-backfill-run.json
```

レスポンスの `backfilled` 件数と dry-run の件数が一致することを確認する。

#### 4. 再実行（べき等）

途中で失敗した場合や追加で `kind` 欠損レコードが見つかった場合は、再度 `{"dryRun": false}` で invoke する。既に `kind` を持つ Piece は自動 skip される（べき等）。

#### 5. 確認

- 1 件サンプリング: `aws dynamodb get-item --table-name classical-music-pieces[-<stage>] --key '{"id": {"S": "<対象ID>"}}'` で `kind` 属性が `"work"` になっていることを確認
- 全件確認（小規模環境のみ）: `aws dynamodb scan --table-name classical-music-pieces[-<stage>] --filter-expression 'attribute_not_exists(kind)' --output json` の `Count` が 0 になっていること
- フロントエンドで楽曲一覧・詳細ページが従来どおり表示されることを確認

### ロールバック

`kind` の付与のみであり、`updatedAt` も触らないためロールバックの必要は通常ない。万一テーブル全体を巻き戻す必要がある場合は、手順 1 のオンデマンドバックアップから別テーブル名で復元し、差分確認後に本番テーブルへ差し替える。

### 移行完了後

全環境（stg / prod）で `skippedAlreadyKind === total` となり `backfilled === 0` になることを確認したら、別 PR で次のクリーンアップを行う:

1. `cdk/lib/migrations-stack.ts` から `MigratePieceKindBackfill` Lambda・LogGroup・IAM ロールを削除
2. `backend/src/migrations/piece-kind-backfill/` ディレクトリを削除
3. `docs/OPERATIONS.md` の本セクションを削除
4. （任意）`DynamoDBPieceRepository.normalizeLegacyKind` の互換ロジックも別 PR で除去できる

---

## dev 環境の撤去（手動 destroy 手順）

> **対象は dev 環境のみ**。stg は staging 環境として今後も維持するため、本手順の対象外（destroy しない）。

### 背景

1 人開発で運用負荷・コストを抑えるため、dev 環境を廃止する（stg は staging として維持）。CDK コード（`cdk/bin/app.ts` の `validStages` ほか）からは dev スタックの定義を削除済みのため、現行コードでは dev スタックを `cdk destroy` の対象として instantiate できない。dev スタックを destroy するには、dev を instantiate していた**旧コードを `git checkout` してから** `cdk destroy` を実行する必要がある。

### 手順

#### 1. 旧コードで dev スタックを destroy

dev を instantiate していたコミット（`validStages` に `dev` が含まれていた時点）を `cdk/` 配下にチェックアウトしてから destroy する。

```bash
cd cdk
git checkout <dev-を含む旧コミット> -- bin/app.ts lib/classical-music-lake-stack.ts lib/migrations-stack.ts
STAGE_NAME=dev npx cdk destroy ClassicalMusicLakeStack-dev MigrationsStack-dev
```

destroy 完了後、チェックアウトした旧コードは元に戻す（`git checkout HEAD -- cdk/bin/app.ts cdk/lib/...`）。

#### 2. terminationProtection

dev スタックは `terminationProtection=false` のため、追加操作なしで destroy できる（prod のような保護解除は不要）。

#### 3. RETAIN テーブルの孤児処理

削除ポリシーが RETAIN のテーブルはスタック削除後も残るため、不要なら手動削除する。

```bash
# RETAIN（スタック削除後も残存 → 不要なら手動削除）
aws dynamodb delete-table --table-name classical-music-listening-logs-dev
aws dynamodb delete-table --table-name classical-music-pieces-dev
aws dynamodb delete-table --table-name classical-music-composers-dev
```

`classical-music-concert-logs-dev` は削除ポリシーが DESTROY のため、スタック削除時に自動削除される（手動操作不要）。

#### 4. Cognito / S3（dev）

dev の Cognito User Pool と S3 バケット（`autoDeleteObjects` 有効）は DESTROY ポリシーのため、スタック削除時に自動削除される。

#### 5. CloudWatch ロググループ（dev）

dev のロググループは removalPolicy DESTROY のためスタック削除時に削除される。万一残った場合は手動削除する。

```bash
aws logs delete-log-group --log-group-name /aws/lambda/ClassicalMusicLake-<関数名>-dev
```
