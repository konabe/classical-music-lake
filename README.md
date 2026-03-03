# Classical Music Lake

クラシック音楽の鑑賞体験を記録・管理するWebアプリケーション。

## 機能一覧

- **視聴ログ記録** - CD・配信で聴いた演奏（作曲家・曲名・演奏家・指揮者）を記録
- **評価・メモ** - 5段階評価とフリーテキストでの感想
- **お気に入り管理** - 特別な演奏をお気に入りとしてマーク

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Nuxt 3 (Vue 3 / TypeScript / SPA) |
| バックエンド | AWS Lambda (Node.js 24.x / TypeScript) |
| API | AWS API Gateway (REST) |
| DB | AWS DynamoDB |
| ホスティング | AWS S3 + CloudFront |
| IaC | AWS CDK (TypeScript) |
| CI/CD | GitHub Actions |

## セットアップ

### 必須ツール

- Node.js 24.x 以上
- AWS CLI（設定済み）
- AWS CDK CLI (`npm install -g aws-cdk`)

### フロントエンド（ローカル開発）

```bash
# リポジトリのクローン
git clone https://github.com/konabe/classical-music-lake.git
cd classical-music-lake

# 依存パッケージインストール
npm install

# 環境変数設定
cp .env.example .env
# .env を編集して API_BASE_URL を設定

# 開発サーバー起動
npm run dev
```

### バックエンド

```bash
cd backend
npm install
# Lambda 関数は AWS デプロイ後に動作確認できます
```

### インフラデプロイ（CDK）

```bash
cd cdk
npm install

# 初回のみ Bootstrap
cdk bootstrap

# デプロイ
cdk deploy
```

### CI/CD（GitHub Actions）

以下のシークレットをリポジトリに設定してください：

| シークレット名 | 説明 |
|--------------|------|
| `AWS_ACCESS_KEY_ID` | AWSアクセスキー |
| `AWS_SECRET_ACCESS_KEY` | AWSシークレットキー |
| `AWS_REGION` | AWSリージョン（例: `ap-northeast-1`）|
| `API_BASE_URL` | デプロイ後のAPI GatewayのURL |

`main` ブランチへのプッシュで自動デプロイされます。

## 環境変数

| 変数名 | 説明 | 例 |
|--------|------|----|
| `API_BASE_URL` | API GatewayのベースURL（末尾スラッシュなし） | `https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod` |

## 使い方

1. トップページから「視聴ログ」に移動
2. 「新規登録」ボタンから視聴した演奏を記録
3. 作曲家・曲名・演奏家・指揮者・評価・メモを入力して保存
4. 一覧画面で過去の記録を確認・編集・削除

## トラブルシューティング

### CORS エラーが発生する

API GatewayのURLが正しく設定されているか確認してください。`.env` の `API_BASE_URL` の末尾にスラッシュが含まれていないことを確認してください。

### デプロイが失敗する

- AWS CLIの認証情報が正しく設定されているか確認してください
- `cdk bootstrap` を実行済みか確認してください
- GitHub Actionsのシークレットが正しく設定されているか確認してください

## ドキュメント

- [システム仕様書](docs/SPEC.md)
- [インセプションデッキ](docs/INCEPTION_DECK.md)
