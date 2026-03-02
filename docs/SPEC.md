# Classical Music Lake - システム仕様書

## 1. システム概要

### 1.1 目的
クラシック音楽の鑑賞体験を記録・管理するためのWebアプリケーション。

### 1.2 主要機能
- **視聴ログ管理**: CD・配信サービス等で聴いた録音の記録
- **コンサート記録管理**: 実際に足を運んだコンサートの記録

### 1.3 想定ユーザー
クラシック音楽愛好家（個人利用を想定）

---

## 2. アーキテクチャ

### 2.1 システム構成図
```
[ユーザー]
    ↓
[CloudFront] ← S3 (静的ホスティング)
    ↓
[Nuxt.js SPA]
    ↓ (API呼び出し)
[API Gateway]
    ↓
[Lambda Functions]
    ↓
[DynamoDB]
```

### 2.2 技術スタック

#### フロントエンド
- **フレームワーク**: Nuxt 3 (Vue 3)
- **言語**: TypeScript
- **ビルドモード**: SPA (SSR無効)
- **ホスティング**: S3 + CloudFront

#### バックエンド
- **ランタイム**: Node.js 24.x
- **API**: REST API (API Gateway + Lambda)
- **言語**: TypeScript
- **データベース**: DynamoDB

#### インフラ
- **IaC**: AWS CDK (TypeScript)
- **CI/CD**: GitHub Actions
- **クラウド**: AWS

---

## 3. データモデル

### 3.1 視聴ログ (ListeningLog)

#### DynamoDBテーブル
- **テーブル名**: `classical-music-listening-logs`
- **パーティションキー**: `id` (String)
- **課金モード**: オンデマンド

#### データ構造
```typescript
interface ListeningLog {
  id: string                // UUID (自動生成)
  listenedAt: string        // 視聴日時 (ISO 8601形式)
  composer: string          // 作曲家名
  piece: string             // 曲名
  performer: string         // 演奏家・楽団名
  conductor?: string        // 指揮者名 (任意)
  rating: number            // 評価 (1〜5の整数)
  isFavorite: boolean       // お気に入りフラグ
  memo?: string             // 感想・メモ (任意)
  createdAt: string         // 作成日時 (ISO 8601形式)
  updatedAt: string         // 更新日時 (ISO 8601形式)
}
```

#### バリデーション
- `rating`: 1〜5の範囲
- `listenedAt`: ISO 8601形式の日時文字列

### 3.2 コンサート記録 (Concert)

#### DynamoDBテーブル
- **テーブル名**: `classical-music-concerts`
- **パーティションキー**: `id` (String)
- **課金モード**: オンデマンド

#### データ構造
```typescript
interface Concert {
  id: string                // UUID (自動生成)
  date: string              // 公演日 (YYYY-MM-DD形式)
  venue: string             // 会場名
  title: string             // 公演タイトル
  orchestra?: string        // オーケストラ・楽団名 (任意)
  conductor?: string        // 指揮者名 (任意)
  soloists?: string[]       // ソリスト名の配列 (任意)
  program: string[]         // 演奏曲目のリスト
  rating: number            // 評価 (1〜5の整数)
  isFavorite: boolean       // お気に入りフラグ
  memo?: string             // 感想・メモ (任意)
  createdAt: string         // 作成日時 (ISO 8601形式)
  updatedAt: string         // 更新日時 (ISO 8601形式)
}
```

#### バリデーション
- `rating`: 1〜5の範囲
- `date`: YYYY-MM-DD形式の日付文字列
- `program`: 最低1曲以上

---

## 4. API仕様

### 4.1 エンドポイント構成
- **ベースURL**: `https://{api-gateway-url}/prod`
- **認証**: なし（現在は認証なし）
- **CORS**: 全オリジン許可

### 4.2 視聴ログAPI

#### `GET /listening-logs`
視聴ログの一覧を取得

**リクエスト**
```
GET /listening-logs
```

**レスポンス**
```json
{
  "statusCode": 200,
  "body": [
    {
      "id": "uuid",
      "listenedAt": "2024-01-15T19:30:00Z",
      "composer": "ベートーヴェン",
      "piece": "交響曲第9番",
      "performer": "ベルリン・フィルハーモニー管弦楽団",
      "conductor": "ヘルベルト・フォン・カラヤン",
      "rating": 5,
      "isFavorite": true,
      "memo": "圧倒的な迫力",
      "createdAt": "2024-01-15T20:00:00Z",
      "updatedAt": "2024-01-15T20:00:00Z"
    }
  ]
}
```

**ソート順**: `listenedAt` 降順（新しい順）

#### `GET /listening-logs/{id}`
特定の視聴ログを取得

**リクエスト**
```
GET /listening-logs/{id}
```

**レスポンス**
- 成功: `200` + ListeningLogオブジェクト
- 未存在: `404 Not Found`

#### `POST /listening-logs`
新規視聴ログを作成

**リクエスト**
```json
POST /listening-logs
Content-Type: application/json

{
  "listenedAt": "2024-01-15T19:30:00Z",
  "composer": "ベートーヴェン",
  "piece": "交響曲第9番",
  "performer": "ベルリン・フィルハーモニー管弦楽団",
  "conductor": "ヘルベルト・フォン・カラヤン",
  "rating": 5,
  "isFavorite": true,
  "memo": "圧倒的な迫力"
}
```

**レスポンス**
- 成功: `201 Created` + 作成されたListeningLogオブジェクト
- バリデーションエラー: `400 Bad Request`

**自動生成項目**
- `id`: UUID v4
- `createdAt`: 現在時刻
- `updatedAt`: 現在時刻

#### `PUT /listening-logs/{id}`
既存の視聴ログを更新

**リクエスト**
```json
PUT /listening-logs/{id}
Content-Type: application/json

{
  "rating": 4,
  "memo": "聴き直したら少し重く感じた"
}
```

**レスポンス**
- 成功: `200 OK` + 更新されたListeningLogオブジェクト
- 未存在: `404 Not Found`

**更新動作**
- 部分更新（Partial Update）をサポート
- `updatedAt`は自動更新
- `id`, `createdAt`は更新不可

#### `DELETE /listening-logs/{id}`
視聴ログを削除

**リクエスト**
```
DELETE /listening-logs/{id}
```

**レスポンス**
- 成功: `200 OK`
- 未存在: `404 Not Found`

### 4.3 コンサートAPI

#### `GET /concerts`
コンサート記録の一覧を取得

**リクエスト**
```
GET /concerts
```

**レスポンス**
```json
{
  "statusCode": 200,
  "body": [
    {
      "id": "uuid",
      "date": "2024-03-20",
      "venue": "サントリーホール",
      "title": "新日本フィルハーモニー交響楽団 第600回定期演奏会",
      "orchestra": "新日本フィルハーモニー交響楽団",
      "conductor": "井上道義",
      "soloists": ["辻井伸行"],
      "program": [
        "ラフマニノフ: ピアノ協奏曲第2番",
        "チャイコフスキー: 交響曲第5番"
      ],
      "rating": 5,
      "isFavorite": true,
      "memo": "辻井さんの演奏が素晴らしかった",
      "createdAt": "2024-03-20T22:00:00Z",
      "updatedAt": "2024-03-20T22:00:00Z"
    }
  ]
}
```

**ソート順**: `date` 降順（新しい順）

#### `GET /concerts/{id}`
特定のコンサート記録を取得

#### `POST /concerts`
新規コンサート記録を作成

#### `PUT /concerts/{id}`
既存のコンサート記録を更新

#### `DELETE /concerts/{id}`
コンサート記録を削除

**※ 各エンドポイントの動作は視聴ログAPIと同様**

---

## 5. インフラ構成

### 5.1 AWSリソース

#### DynamoDB
- **ListeningLogs**: `classical-music-listening-logs`
- **Concerts**: `classical-music-concerts`
- **削除ポリシー**: RETAIN（データ保持）

#### Lambda
- **ランタイム**: Node.js 24.x
- **関数数**: 10個（各リソース×5操作）
- **環境変数**:
  - `DYNAMO_TABLE_LISTENING_LOGS`
  - `DYNAMO_TABLE_CONCERTS`

#### API Gateway
- **名前**: `classical-music-lake`
- **ステージ**: `prod`
- **CORS**: 有効（全オリジン許可）

#### S3
- **用途**: SPAの静的ファイルホスティング
- **パブリックアクセス**: ブロック（CloudFront経由のみ）
- **削除ポリシー**: DESTROY（自動削除）

#### CloudFront
- **用途**: SPAの配信
- **エラーハンドリング**: 404/403 → index.html（SPA対応）
- **プロトコル**: HTTPS強制

### 5.2 環境変数

#### フロントエンド
- `NUXT_PUBLIC_API_BASE_URL`: API GatewayのURL

#### バックエンド（Lambda）
- `DYNAMO_TABLE_LISTENING_LOGS`: 視聴ログテーブル名
- `DYNAMO_TABLE_CONCERTS`: コンサートテーブル名

---

## 6. デプロイメント

### 6.1 デプロイフロー
```
GitHub (main branch)
  → GitHub Actions
    → Nuxt ビルド (npm run generate)
    → CDK デプロイ
      → Lambda + API Gateway + DynamoDB 作成
      → S3 + CloudFront 作成
      → SPAファイル デプロイ
```

### 6.2 GitHub Actions
- **トリガー**: `push to main`, `workflow_dispatch`
- **環境変数**:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
  - `API_BASE_URL`

---

## 7. 開発環境

### 7.1 必須ツール
- Node.js 24.x以上
- npm または yarn
- AWS CLI
- AWS CDK CLI

### 7.2 ローカル開発

#### フロントエンド起動
```bash
# 依存パッケージインストール
npm install

# 環境変数設定
export NUXT_PUBLIC_API_BASE_URL=https://your-api-url/prod

# 開発サーバー起動
npm run dev
```

#### バックエンド開発
```bash
cd backend
npm install
# Lambda関数は AWS SAM や Serverless Framework でローカルテスト可能
```

#### インフラデプロイ
```bash
cd cdk
npm install
cdk bootstrap  # 初回のみ
cdk deploy
```

---

## 8. 制限事項・今後の課題

### 8.1 現在の制限
- **認証なし**: 誰でもアクセス・編集可能
- **検索機能なし**: DynamoDB Scanのみ
- **ページネーションなし**: 全件取得のみ
- **画像アップロードなし**: テキストベースのみ

### 8.2 将来的な拡張案
- ユーザー認証・認可（Cognito等）
- 全文検索（OpenSearch等）
- ページネーション
- アルバムカバー画像の管理
- タグ・カテゴリ機能
- データのエクスポート機能
- 統計・分析ダッシュボード

---

## 9. 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-03-02 | 1.0.1 | Node.js 24.x対応 |
| 2026-03-02 | 1.0.0 | 初版作成 |
