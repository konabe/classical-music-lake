# アーキテクチャ設計書

## システム構成図

```
[ユーザー（ブラウザ）]
        ↓ HTTPS
[CloudFront]
  ├── S3 (静的ファイル: Nuxt SPA)
  └── ↓ /prod/* へのリクエスト
[API Gateway (REST + Cognito Authorizer)]
        ↓
[Lambda Functions (Node.js 24.x)]
        ↓↓
    [DynamoDB] [AWS Cognito User Pool]
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
├── app/                          # Nuxt アプリケーションディレクトリ
│   ├── middleware/               # Nuxt ルートミドルウェア
│   │   └── auth.ts               # 認証チェック（未ログイン時に /auth/login へリダイレクト）
│   ├── pages/                    # Nuxt ページ（ルーティング）
│   │   ├── index.vue             # トップページ（管理者向けリンクセクション含む）
│   │   ├── auth/
│   │   │   ├── user-register.vue # ユーザー登録ページ
│   │   │   └── login.vue         # ログインページ
│   │   ├── listening-logs/       # 視聴ログ関連ページ（要認証）
│   │   │   ├── index.vue         # 一覧
│   │   │   ├── new.vue           # 新規作成
│   │   │   └── [id]/
│   │   │       ├── index.vue     # 詳細
│   │   │       └── edit.vue      # 編集
│   │   └── pieces/               # 楽曲マスタ関連ページ
│   │       ├── index.vue         # 一覧
│   │       ├── new.vue           # 新規作成
│   │       └── [id]/
│   │           └── edit.vue      # 編集
│   ├── components/               # 共通UIコンポーネント
│   ├── composables/              # Vue Composables（共通ロジック）
│   └── types/                    # フロントエンド共通型定義
├── backend/
│   └── src/
│       ├── auth/                 # 認証 Lambda 関数
│       │   ├── register.ts       # ユーザー登録
│       │   └── login.ts          # ログイン（JWT トークン発行）
│       ├── listening-logs/       # 視聴ログ Lambda 関数
│       │   ├── create.ts
│       │   ├── list.ts
│       │   ├── get.ts
│       │   ├── update.ts
│       │   └── delete.ts
│       ├── pieces/               # 楽曲マスタ Lambda 関数
│       │   ├── create.ts
│       │   ├── list.ts
│       │   ├── get.ts
│       │   ├── update.ts
│       │   └── delete.ts
│       ├── types/                # バックエンド共通型定義
│       └── utils/                # DynamoDB クライアント、レスポンスヘルパー、認証ヘルパーなど
│           ├── auth.ts           # getUserId: Cognito Authorizer claims から userId を取得
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
  → GET /prod/listening-logs (Authorization: Bearer <token>)
  → API Gateway
  → Cognito Authorizer (JWT 検証 + sub 抽出)
  → Lambda (list.ts)
  → userId = event.requestContext.authorizer.claims.sub
  → DynamoDB Query (GSI1: userId = :userId, sortKey: createdAt)
  → レスポンス (listenedAt 降順ソート)
  → ブラウザに返却
```

### 視聴ログ作成

```
ブラウザ
  → POST /prod/listening-logs (Authorization: Bearer <token>, JSON body)
  → API Gateway
  → Cognito Authorizer (JWT 検証 + sub 抽出)
  → Lambda (create.ts)
  → userId = event.requestContext.authorizer.claims.sub
  → UUID 生成 + userId/createdAt/updatedAt 付与
  → DynamoDB PutItem
  → 201 Created + 作成済みオブジェクト
  → ブラウザに返却
```

### ログイン

```
ブラウザ (/auth/login)
  → POST /prod/auth/login (email, password)
  → API Gateway
  → Lambda (login.ts)
  → Cognito InitiateAuth
  → AccessToken をレスポンス
  → localStorage に保存
  → / へナビゲート
```

### ログアウト

```
ブラウザ (ナビバーの「ログアウト」ボタン)
  → localStorage から accessToken を削除
  → /auth/login へナビゲート
  ※ バックエンド呼び出しなし（JWT ステートレス）
```

---

## 技術選定の理由

| 技術                | 選定理由                                                           |
| ------------------- | ------------------------------------------------------------------ |
| **Nuxt 3 (SPA)**    | Vue 3 + TypeScript の開発体験、SSR不要なため静的ホスティングで十分 |
| **AWS Lambda**      | サーバーレスで運用コスト低、個人利用規模に適切                     |
| **DynamoDB**        | スキーマレスで柔軟、オンデマンド課金で低コスト                     |
| **API Gateway**     | Lambda との親和性、CORS設定が容易                                  |
| **AWS CDK**         | TypeScript でインフラをコード管理、型安全                          |
| **CloudFront + S3** | SPA の静的ホスティングとして低コスト・高可用性                     |

---

## 設計上の制約・トレードオフ

### 認証・認可（実装済み）

- **状態**: AWS Cognito によるユーザー登録・ログイン・ログアウト・API 保護を実装済み
- **実装内容**:
  - `POST /auth/register`: Cognito ユーザー登録、メール確認フロー
  - `POST /auth/login`: Cognito 認証、JWT (AccessToken) を localStorage に保存
  - ログアウト: クライアント側のみ（localStorage からトークン削除 + `/auth/login` へリダイレクト）
  - `middleware/auth.ts`: `/listening-logs/**` への未認証アクセスをフロントエンド側で制限
  - **API Gateway Cognito Authorizer**: `/listening-logs/**` の全エンドポイントで JWT 検証を実施。未認証リクエストは 401 を返す
  - **userId によるアクセス制御**: Lambda が `claims.sub` をキーに自分のデータのみ返却。他ユーザーのリソースへのアクセスは 404 で返却（存在隠蔽）
- **残タスク**: Refresh Token の無効化・Token Blacklist は将来フェーズで対応

### DynamoDB アクセスパターン

- **視聴ログ一覧 (List)**: GSI1（PK: `userId`, SK: `createdAt`）を使った Query — ユーザー別に O(n) でスキャン不要
- **視聴ログ取得・更新・削除 (Get/Update/Delete)**: PK の `id`（UUID）で GetItem し、取得後に `userId` を照合してアクセス制御
- **トレードオフ**: PK を `id` のまま維持し GSI を追加することで、Get/Update/Delete の一意解決と List のユーザー別クエリを両立

### CORS 設定

- **状態**: CloudFront URL のみ許可（`/listening-logs/**` には `Authorization` ヘッダーも追加）
- **実装**: `addCors()` ヘルパーに `allowHeaders` パラメーターを追加し、エンドポイントごとに制御

### フロントエンド・バックエンドの型定義が分離

- **理由**: フロントエンド（`types/`）とバックエンド（`backend/src/types/`）が独立したパッケージ構成
- **トレードオフ**: 重複するが、依存関係を分離することでデプロイの独立性を確保
