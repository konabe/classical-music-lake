# アーキテクチャ設計書

## システム構成図

```
[ユーザー（ブラウザ）]
        ↓ HTTPS
[CloudFront]
  ├── S3 (静的ファイル: Nuxt SPA)
  └── ↓ /prod/* へのリクエスト
[API Gateway (REST)]
        ↓
[Lambda Functions (Node.js 24.x)]
        ↓
[DynamoDB]
```

### デプロイパイプライン

```
[GitHub (main ブランチ)]
        ↓ push
[GitHub Actions]
  ├── npm run generate  → S3 へアップロード
  └── cdk deploy        → Lambda / API Gateway / DynamoDB 更新
```

---

## ディレクトリ構造

```
classical-music-lake/
├── pages/                        # Nuxt ページ（ルーティング）
│   ├── index.vue                 # トップページ
│   └── listening-logs/           # 視聴ログ関連ページ
│       ├── index.vue             # 一覧
│       ├── new.vue               # 新規作成
│       └── [id]/
│           ├── index.vue         # 詳細
│           └── edit.vue          # 編集
├── components/                   # 共通UIコンポーネント
├── composables/                  # Vue Composables（共通ロジック）
├── types/                        # フロントエンド共通型定義
├── backend/
│   └── src/
│       ├── listening-logs/       # 視聴ログ Lambda 関数
│       │   ├── create.ts
│       │   ├── list.ts
│       │   ├── get.ts
│       │   ├── update.ts
│       │   └── delete.ts
│       ├── types/                # バックエンド共通型定義
│       └── utils/                # DynamoDB クライアントなど
├── cdk/
│   └── lib/
│       └── classical-music-lake-stack.ts  # AWSインフラ定義
├── docs/
│   ├── SPEC.md                   # システム仕様書
│   ├── ARCHITECTURE.md           # 本ドキュメント
│   ├── INCEPTION_DECK.md         # インセプションデッキ
│   └── AI_DRIVEN_DEV_CHECKLIST.md
└── .github/
    └── workflows/                # GitHub Actions ワークフロー
```

---

## データフロー図

### 視聴ログ一覧取得

```
ブラウザ
  → GET /prod/listening-logs
  → API Gateway
  → Lambda (list.ts)
  → DynamoDB Scan (classical-music-listening-logs)
  → レスポンス (listenedAt 降順ソート)
  → ブラウザに返却
```

### 視聴ログ作成

```
ブラウザ
  → POST /prod/listening-logs (JSON body)
  → API Gateway
  → Lambda (create.ts)
  → UUID 生成 + createdAt/updatedAt 付与
  → DynamoDB PutItem
  → 201 Created + 作成済みオブジェクト
  → ブラウザに返却
```

---

## 技術選定の理由

| 技術 | 選定理由 |
|------|---------|
| **Nuxt 3 (SPA)** | Vue 3 + TypeScript の開発体験、SSR不要なため静的ホスティングで十分 |
| **AWS Lambda** | サーバーレスで運用コスト低、個人利用規模に適切 |
| **DynamoDB** | スキーマレスで柔軟、オンデマンド課金で低コスト |
| **API Gateway** | Lambda との親和性、CORS設定が容易 |
| **AWS CDK** | TypeScript でインフラをコード管理、型安全 |
| **CloudFront + S3** | SPA の静的ホスティングとして低コスト・高可用性 |

---

## 設計上の制約・トレードオフ

### 認証なし（現在）
- **理由**: MVP として機能優先
- **リスク**: 誰でもデータ操作可能
- **対応予定**: Cognito によるユーザー認証（フェーズ3）

### DynamoDB Scan による全件取得
- **理由**: シンプルな実装優先、データ量が少ない個人利用想定
- **リスク**: データ量増加時のパフォーマンス・コスト悪化
- **対応予定**: ページネーション・インデックス追加（フェーズ3）

### CORS 全オリジン許可
- **理由**: 開発・デプロイの手軽さ
- **リスク**: 本番環境でのセキュリティリスク
- **対応予定**: 認証実装時に合わせてオリジン制限

### フロントエンド・バックエンドの型定義が分離
- **理由**: フロントエンド（`types/`）とバックエンド（`backend/src/types/`）が独立したパッケージ構成
- **トレードオフ**: 重複するが、依存関係を分離することでデプロイの独立性を確保
