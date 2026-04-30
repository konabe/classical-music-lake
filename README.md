# Classical Music Lake

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=konabe_classical-music-lake&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=konabe_classical-music-lake)
[![codecov](https://codecov.io/gh/konabe/classical-music-lake/graph/badge.svg?token=Q5QFLF326W)](https://codecov.io/gh/konabe/classical-music-lake)
[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fkonabe%2Fclassical-music-lake%2Fmain)](https://dashboard.stryker-mutator.io/reports/github.com/konabe/classical-music-lake/main)

クラシック音楽の鑑賞体験を記録・管理するWebアプリケーション。

## 環境

| 環境 | URL                                                  |
| ---- | ---------------------------------------------------- |
| prod | [nocturne-app.com](https://nocturne-app.com)         |
| stg  | [stg.nocturne-app.com](https://stg.nocturne-app.com) |
| dev  | [dev.nocturne-app.com](https://dev.nocturne-app.com) |

## 機能一覧

- **ユーザー認証** - メールアドレス + パスワード（Cognito、メール確認コードあり）/ Google OAuth（Cognito Hosted UI 経由）
- **視聴ログ記録** - CD・配信で聴いた演奏を記録（作曲家・曲名・視聴日時・5段階評価・お気に入り・メモ）
- **視聴ログの検索フィルタ** - キーワード／評価／お気に入り／期間によるクライアントサイド絞り込み
- **視聴ログの統計ダッシュボード** - 総数・お気に入り数・平均評価・評価分布・作曲家ランキング・月別トレンド
- **コンサート記録** - 実際に聴いたコンサートを記録（タイトル・開催日時・会場・指揮者・オーケストラ・ソリスト・プログラム）
- **楽曲マスタ管理** - 楽曲（曲名・作曲家・ジャンル・時代・編成・地域・動画 URL）の CRUD（書き込みは管理者のみ）
- **作曲家マスタ管理** - 作曲家（名前・時代・地域・肖像画像 URL）の CRUD（書き込みは管理者のみ）
- **ライト/ダークモード切替** - ヘッダーのトグルで切替（システム設定追従、localStorage に永続化）

## 技術スタック

| レイヤー       | 技術                                                         |
| -------------- | ------------------------------------------------------------ |
| フロントエンド | Nuxt 3 (Vue 3 / TypeScript / SPA)                            |
| バックエンド   | AWS Lambda (Node.js 24.x / TypeScript、DDD レイヤー構造)     |
| API            | AWS API Gateway (REST + Cognito Authorizer)                  |
| DB             | AWS DynamoDB                                                 |
| 認証           | AWS Cognito User Pool（メール認証 + Google OAuth Hosted UI） |
| ホスティング   | AWS S3 + CloudFront                                          |
| DNS / 証明書   | AWS Route53 + ACM（カスタムドメイン `nocturne-app.com`）     |
| IaC            | AWS CDK (TypeScript)                                         |
| CI/CD          | GitHub Actions（OIDC によるキーレス認証）                    |

## セットアップ

### 必須ツール

- Node.js 24.x 以上
- AWS CLI（設定済み）
- pnpm (`corepack enable` で有効化)
- AWS CDK CLI (`pnpm add -g aws-cdk`)

### フロントエンド（ローカル開発）

```bash
# リポジトリのクローン
git clone https://github.com/konabe/classical-music-lake.git
cd classical-music-lake

# 依存パッケージインストール
pnpm install

# 環境変数設定
cp .env.example .env
# .env を編集して NUXT_PUBLIC_API_BASE_URL を設定

# 開発サーバー起動
pnpm run dev
```

### バックエンド

```bash
cd backend
pnpm install
# Lambda 関数は AWS デプロイ後に動作確認できます
```

### インフラデプロイ（CDK）

```bash
cd cdk
pnpm install

# 初回のみ Bootstrap
cdk bootstrap

# デプロイ
cdk deploy
```

### CI/CD（GitHub Actions）

以下のシークレットをリポジトリに設定してください：

| シークレット名         | 必須 | 説明                                                                      |
| ---------------------- | ---- | ------------------------------------------------------------------------- |
| `AWS_ROLE_TO_ASSUME`   | ✅   | AssumeRole 対象の IAM ロール ARN（GitHub OIDC によるキーレス認証で使用）  |
| `GOOGLE_CLIENT_ID`     | ✅   | Google OAuth（Cognito Hosted UI 連携）のクライアント ID                   |
| `GOOGLE_CLIENT_SECRET` | ✅   | Google OAuth のクライアントシークレット                                   |
| `ALERT_EMAIL`          | -    | CloudWatch アラート通知先メールアドレス（カンマ区切りで複数指定可、任意） |

> **注意**: `AWS_REGION` はワークフロー内に `ap-northeast-1` でハードコードされています。API Gateway の URL や Cognito の各種値は CloudFormation Outputs から自動取得するため、シークレットとして設定する必要はありません。

#### デプロイトリガー（`deploy.yml`）

| トリガー                        | デプロイ先                |
| ------------------------------- | ------------------------- |
| `main` ブランチへの push        | stg 環境                  |
| GitHub Release の publish       | prod 環境                 |
| `dev*` タグの push              | dev 環境                  |
| `workflow_dispatch`（手動実行） | dev / stg / prod から選択 |

### GitHub OIDC + IAM ロール設定

このワークフローは GitHub Actions OIDC を使ったキーレス認証を採用しています。事前に以下を設定してください：

1. AWS IAM で ID プロバイダー（`token.actions.githubusercontent.com`）を作成
2. 最小権限の IAM ロールを作成し、信頼ポリシーに以下を設定：
   - **Action**: `sts:AssumeRoleWithWebIdentity`
   - **Condition**:
     - `token.actions.githubusercontent.com:aud` = `sts.amazonaws.com`
     - `token.actions.githubusercontent.com:sub` = `repo:<org>/<repo>:ref:refs/heads/<branch>`（例: `repo:konabe/classical-music-lake:ref:refs/heads/main`）
3. ロール ARN を `AWS_ROLE_TO_ASSUME` シークレットに設定

`main` ブランチへのプッシュで stg 環境へ、GitHub Release の publish で prod 環境へ自動デプロイされます。

## 環境変数

| 変数名                     | 説明                                         | 例                                                                 |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| `NUXT_PUBLIC_API_BASE_URL` | API GatewayのベースURL（末尾スラッシュなし） | `https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod` |

## 使い方

1. **アカウント登録**: `/auth/user-register` でメールアドレスとパスワードを入力 → メールに届いた確認コードを `/auth/verify-email` で入力すると自動ログイン（Google アカウントでのログインも可）
2. **視聴ログ記録**: ヘッダーの「鑑賞記録」→「新規作成」から、視聴日時・作曲家・曲名・5段階評価・お気に入り・メモを入力して保存
3. **一覧・検索・統計**: 一覧画面でキーワード／評価／お気に入り／期間で絞り込み。「統計」から評価分布・作曲家ランキング・月別トレンドを確認
4. **コンサート記録**: ヘッダーの「コンサート記録」→「新規作成」から、タイトル・開催日時・会場・指揮者・オーケストラ・ソリスト・プログラム（楽曲マスタから選択）を入力して保存
5. **マスタ管理（管理者のみ）**: 「楽曲マスタ」「作曲家マスタ」から CRUD を実行（admin Cognito グループに所属するユーザーのみ書き込み可能。参照は誰でも可）

## トラブルシューティング

### CORS エラーが発生する

API GatewayのURLが正しく設定されているか確認してください。`.env` の `NUXT_PUBLIC_API_BASE_URL` の末尾にスラッシュが含まれていないことを確認してください。

### デプロイが失敗する

- AWS CLIの認証情報が正しく設定されているか確認してください
- `cdk bootstrap` を実行済みか確認してください
- GitHub Actionsのシークレットが正しく設定されているか確認してください

## ディレクトリ構造

```text
classical-music-lake/
├── app/                          # Nuxt アプリケーション
│   ├── assets/                   # CSS（ライト/ダークモードのテーマ変数等）
│   ├── layouts/                  # default / auth レイアウト
│   ├── middleware/               # auth / admin ルートミドルウェア
│   ├── pages/                    # Nuxt ページ
│   │   ├── auth/                 # login / user-register / verify-email
│   │   ├── listening-logs/       # 視聴ログ（一覧・新規・統計・詳細・編集）
│   │   ├── concert-logs/         # コンサート記録（一覧・新規・詳細・編集）
│   │   ├── pieces/               # 楽曲マスタ（一覧・新規・詳細・編集）
│   │   └── composers/            # 作曲家マスタ（一覧・新規・詳細・編集）
│   ├── components/               # Atomic Design（atoms / molecules / organisms / templates）
│   ├── composables/              # API 呼び出し・認証・フィルタ・統計などの共通ロジック
│   ├── utils/                    # フロントエンド共通ユーティリティ
│   └── types/                    # フロントエンド型定義（shared/ から re-export）
├── shared/                       # フロント・バックエンド共通の定数・型定義
├── backend/
│   └── src/
│       ├── handlers/             # Lambda エントリポイント（auth / listening-logs / concert-logs / pieces / composers）
│       ├── usecases/             # ユースケース層
│       ├── repositories/         # DynamoDB アクセス層
│       ├── domain/               # エンティティ・値オブジェクト（DDD）
│       ├── migrations/           # 一時的なデータ移行 Lambda
│       ├── types/                # バックエンド型定義（shared/ から re-export）
│       └── utils/                # DynamoDB クライアント、レスポンスヘルパー、Zod スキーマ等
├── cdk/
│   └── lib/
│       ├── classical-music-lake-stack.ts  # 本番ランタイム（Lambda / API Gateway / DynamoDB / Cognito / S3 / CloudFront）
│       ├── dns-stack.ts                   # Route53 Hosted Zone + ACM 証明書（us-east-1）
│       └── migrations-stack.ts            # 移行用 Lambda（本番スタックから分離）
├── docs/                         # ドキュメント類
└── .github/workflows/            # GitHub Actions ワークフロー
```

詳細は [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) を参照してください。

## ドキュメント

- [システム仕様書](docs/SPEC.md)
- [アーキテクチャ設計書](docs/ARCHITECTURE.md)
- [インセプションデッキ](docs/INCEPTION_DECK.md)
- [運用手順](docs/OPERATIONS.md)
- [コントリビューションガイド](CONTRIBUTING.md)
