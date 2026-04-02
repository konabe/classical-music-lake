# アーキテクチャ設計書

## システム構成図

```text
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

```text
[GitHub (main ブランチ)]
        ↓ push
[GitHub Actions]
  ├── npm run generate  → S3 へアップロード
  └── cdk deploy        → Lambda / API Gateway / DynamoDB 更新
```

---

## ディレクトリ構造

```text
classical-music-lake/
├── app/                          # Nuxt アプリケーションディレクトリ
│   ├── layouts/                  # Nuxt レイアウト
│   │   └── default.vue           # グローバルヘッダー（認証状態に応じたナビゲーション）
│   ├── middleware/               # Nuxt ルートミドルウェア
│   │   └── auth.ts               # 認証チェック（未ログイン時に /auth/login へリダイレクト）
│   ├── pages/                    # Nuxt ページ（ルーティング）
│   │   ├── index.vue             # トップページ（管理者向けリンクセクション含む）
│   │   ├── auth/
│   │   │   ├── user-register.vue # ユーザー登録ページ
│   │   │   ├── verify-email.vue  # メール確認コード入力ページ
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
│   │           ├── index.vue     # 詳細（動画再生 + クイックログ記録）
│   │           └── edit.vue      # 編集
│   ├── components/               # 共通UIコンポーネント（Atomic Design）
│   │   ├── atoms/
│   │   │   ├── CategoryBadge.vue # カテゴリ情報をラベル形式のバッジとして表示する
│   │   │   └── ...
│   │   ├── molecules/
│   │   │   ├── VideoPlayer.vue   # YouTube 埋め込み / 外部リンク切り替えプレイヤー
│   │   │   ├── PieceCategoryList.vue  # 楽曲の4軸カテゴリを集約して CategoryBadge で表示する
│   │   │   ├── PieceItem.vue     # 楽曲一覧の各行（曲名・作曲家・カテゴリバッジ表示）
│   │   │   └── ...
│   │   ├── organisms/
│   │   │   ├── QuickLogForm.vue  # 動画再生後に表示するクイックログ入力フォーム
│   │   │   └── ...
│   │   └── templates/
│   │       ├── PieceDetailTemplate.vue  # 楽曲詳細ページレイアウト（カテゴリバッジ表示含む）
│   │       └── ...
│   ├── composables/              # Vue Composables（共通ロジック）
│   ├── utils/
│   │   └── video.ts              # YouTube URL 判定・動画 ID 抽出・埋め込み URL 変換
│   └── types/                    # フロントエンド共通型定義（shared/ から re-export）
├── shared/                       # フロント・バックエンド共通の定数・型定義
│   └── constants.ts              # カテゴリ定数配列（PIECE_GENRES 等）と導出型
├── backend/
│   └── src/
│       ├── auth/                 # 認証 Lambda 関数
│       │   ├── register.ts       # ユーザー登録
│       │   ├── login.ts          # ログイン（JWT トークン発行）
│       │   ├── verify-email.ts   # メール確認コード検証
│       │   └── resend-verification-code.ts  # 確認コード再送信
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
│       └── utils/                # DynamoDB クライアント、レスポンスヘルパーなど
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

```text
ブラウザ
  → GET /prod/listening-logs
  → API Gateway
  → Lambda (list.ts)
  → DynamoDB Scan (classical-music-listening-logs)
  → レスポンス (listenedAt 降順ソート)
  → ブラウザに返却
```

### 視聴ログ作成

```text
ブラウザ
  → POST /prod/listening-logs (JSON body)
  → API Gateway
  → Lambda (create.ts)
  → UUID 生成 + createdAt/updatedAt 付与
  → DynamoDB PutItem
  → 201 Created + 作成済みオブジェクト
  → ブラウザに返却
```

### ログイン（確認済みユーザー）

```text
ブラウザ (/auth/login)
  → POST /prod/auth/login (email, password)
  → API Gateway
  → Lambda (login.ts)
  → Cognito InitiateAuth
  → AccessToken をレスポンス
  → localStorage に保存
  → / へナビゲート
```

### ログイン（未確認ユーザー）

```text
ブラウザ (/auth/login)
  → POST /prod/auth/login (email, password)
  → Lambda (login.ts)
  → Cognito InitiateAuth → UserNotConfirmedException
  → 403 / UserNotConfirmed をレスポンス
  → sessionStorage に pendingPassword を保存
  → /auth/verify-email へ遷移（history.state.email にメールアドレスを渡す）
ブラウザ (/auth/verify-email)
  → POST /prod/auth/verify-email (email, code)
  → Cognito ConfirmSignUp
  → POST /prod/auth/login (email, password) で自動ログイン（sessionStorage.pendingPassword 使用）
  → sessionStorage から pendingPassword を削除
  → / へナビゲート
```

### ユーザー登録〜メール確認〜自動ログイン

```text
ブラウザ (/auth/user-register)
  → POST /prod/auth/register (email, password)
  → Cognito SignUp → 確認コードをメール送信
  → /auth/verify-email へ自動遷移（ナビゲーションステートで email 渡し、sessionStorage に password 一時保存）
ブラウザ (/auth/verify-email)
  → POST /prod/auth/verify-email (email, code)
  → Cognito ConfirmSignUp
  → POST /prod/auth/login (email, password) で自動ログイン
  → sessionStorage から password を削除
  → / へナビゲート
```

### 楽曲詳細ページでのクイックログ記録

```text
ブラウザ (/pieces/[id])
  → usePiece(id) で Piece を取得
  → PieceDetailTemplate (piece, error)
      → VideoPlayer (videoUrl)
          → YouTube IFrame Player API で再生状態を監視
          → 再生開始時に @play emit
      → @play 受信: hasStartedPlaying = true
      → QuickLogForm (v-if="hasStartedPlaying", composer, piece)
          → 「記録する」で @submit emit { rating, isFavorite, memo }
      → @save emit (pages/pieces/[id]/index.vue へ)
  → useListeningLogs().create({
      listenedAt: new Date().toISOString(),
      composer: piece.composer,
      piece: piece.title,
      ...values,
    })
  → POST /prod/listening-logs → DynamoDB PutItem
  → 完了メッセージ表示（ページ遷移なし）
```

### 視聴ログフォームでの動画プレビュー

```text
ブラウザ (/listening-logs/new, /listening-logs/[id]/edit)
  → ListeningLogForm が usePieces() で楽曲一覧を取得
  → 楽曲マスタセレクトで曲を選択
      → videoUrl あり: selectedVideoUrl に videoUrl をセット
          → VideoPlayer (v-if="selectedVideoUrl") が表示
          → 動画を確認しながらフォームの他の項目を入力可能
      → videoUrl なし / 「選択しない」: selectedVideoUrl = undefined
          → VideoPlayer は非表示
```

### ログアウト

```text
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

### 認証（実装済み）

- **状態**: AWS Cognito によるユーザー登録・ログイン・ログアウトを実装済み
- **実装内容**:
  - `POST /auth/register`: Cognito ユーザー登録、確認コードをメール送信
  - `POST /auth/verify-email`: Cognito ConfirmSignUp、メール確認コード検証
  - `POST /auth/resend-verification-code`: Cognito ResendConfirmationCode、確認コード再送信
  - `POST /auth/login`: Cognito 認証、JWT (AccessToken) を localStorage に保存
  - 登録完了後は `/auth/verify-email` へ自動遷移し、確認後に自動ログイン
  - ログイン時にメール未確認エラー（`UserNotConfirmed`）が返された場合、パスワードを `sessionStorage.pendingPassword` に保存して `/auth/verify-email` へリダイレクト
  - ログアウト: クライアント側のみ（localStorage からトークン削除 + `/auth/login` へリダイレクト）
  - `middleware/auth.ts`: `/listening-logs/**` への未認証アクセスを制限
- **残タスク**: JWT 検証による API 保護（Cognito Authorizer）は将来フェーズで実装予定

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
