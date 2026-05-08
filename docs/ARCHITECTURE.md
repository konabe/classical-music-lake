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
  ├── pnpm run generate  → S3 へアップロード
  └── cdk deploy        → Lambda / API Gateway / DynamoDB 更新
```

---

## ディレクトリ構造

```text
classical-music-lake/
├── app/                          # Nuxt アプリケーションディレクトリ
│   ├── assets/
│   │   └── css/
│   │       └── theme.css         # ライト/ダークモードの CSS 変数定義（@nuxtjs/color-mode と連動）
│   ├── layouts/                  # Nuxt レイアウト
│   │   └── default.vue           # グローバルヘッダー（認証状態に応じたナビゲーション + テーマ切替）
│   ├── middleware/               # Nuxt ルートミドルウェア
│   │   └── auth.ts               # 認証チェック（未ログイン時に /auth/login へリダイレクト）
│   ├── pages/                    # Nuxt ページ（ルーティング）
│   │   ├── index.vue             # トップページ（管理者向けリンクセクション含む）
│   │   ├── auth/
│   │   │   ├── user-register.vue # ユーザー登録ページ
│   │   │   ├── verify-email.vue  # メール確認コード入力ページ
│   │   │   └── login.vue         # ログインページ
│   │   ├── listening-logs/       # 視聴ログ関連ページ（要認証）
│   │   │   ├── index.vue         # 一覧（検索フィルタ付き）
│   │   │   ├── new.vue           # 新規作成
│   │   │   ├── statistics.vue    # 統計ダッシュボード（クライアントサイド集計）
│   │   │   └── [id]/
│   │   │       ├── index.vue     # 詳細
│   │   │       └── edit.vue      # 編集
│   │   ├── concert-logs/         # コンサート記録関連ページ（要認証）
│   │   │   ├── index.vue         # 一覧
│   │   │   ├── new.vue           # 新規作成
│   │   │   └── [id]/
│   │   │       ├── index.vue     # 詳細
│   │   │       └── edit.vue      # 編集
│   │   ├── pieces/               # 楽曲マスタ関連ページ
│   │   │   ├── index.vue         # 一覧
│   │   │   ├── new.vue           # 新規作成
│   │   │   └── [id]/
│   │   │       ├── index.vue     # 詳細（動画再生 + クイックログ記録）
│   │   │       └── edit.vue      # 編集
│   │   └── composers/            # 作曲家マスタ関連ページ
│   │       ├── index.vue         # 一覧
│   │       ├── new.vue           # 新規作成
│   │       └── [id]/
│   │           ├── index.vue     # 詳細
│   │           └── edit.vue      # 編集
│   ├── components/               # 共通UIコンポーネント（Atomic Design: atoms / molecules / organisms / templates）
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
│       ├── concert-logs/         # コンサート記録 Lambda 関数
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
│       ├── migrations/           # 一時的なデータ移行スクリプト（レイヤードアーキテクチャから独立）
│       │   └── piece-composer-id/
│       │       └── index.ts      # composer(string) → composerId 移行（手動 invoke 専用）
│       ├── composers/             # 作曲家マスタ Lambda 関数
│       │   ├── create.ts
│       │   ├── list.ts
│       │   ├── get.ts
│       │   ├── update.ts
│       │   └── delete.ts
│       ├── types/                # バックエンド共通型定義
│       └── utils/                # DynamoDB クライアント、レスポンスヘルパーなど
├── cdk/
│   └── lib/
│       ├── classical-music-lake-stack.ts  # AWSインフラ定義（本番ランタイム）
│       ├── dns-stack.ts                   # Route53 / ACM 証明書（us-east-1）
│       └── migrations-stack.ts            # 一時的な移行 Lambda を集約（本番スタックから分離）
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

### 視聴ログ詳細取得（楽曲マスタへのリンク付き）

```text
ブラウザ (/listening-logs/[id])
  → useListeningLog(id) で ListeningLog を取得
  → GET /prod/listening-logs/{id}
  → log.pieceId が設定されていれば /pieces/{pieceId} へリンク、未設定なら曲名は plain text で表示
```

### 視聴ログ作成・更新（pieceId 付き）

```text
楽曲マスタから記録（QuickLogForm / 楽曲詳細ページ）:
  → POST /prod/listening-logs に pieceId を含めて送信（楽曲マスタの id を信頼ソースとして固定）

自由入力フォーム（/listening-logs/new、/listening-logs/[id]/edit）:
  → 「楽曲マスタから選択」ドロップダウンを選ぶと pieceId が自動設定され、曲名・作曲家名も同期される
  → 「選択しない」を選ぶと曲名・作曲家名はクリアされ、pieceId も undefined となる
  → 編集時に既存の pieceId を解除したい場合は、フォーム側で pieceId="" として送信し、
    バックエンドの buildUpdateProps が DynamoDB 属性を REMOVE する
```

### 視聴ログ検索フィルタ（クライアントサイド）

```text
ブラウザ (/listening-logs)
  → useListeningLogs() で全件取得（GET /listening-logs、API は同じ）
  → useListeningLogFilter(logs) でフィルタ状態を保持
    - keyword（作曲家・曲名・メモを横断する部分一致検索）
    - rating（1〜5）
    - favoriteOnly（お気に入りのみ）
    - fromDate / toDate（listenedAt の範囲）
  → filteredLogs を ListeningLogsTemplate に渡して描画
  ※ サーバー API には絞り込みパラメータを送らない（OpenSearch 連携は将来フェーズ）
```

### 視聴ログ統計取得（クライアントサイド）

```text
ブラウザ (/listening-logs/statistics)
  → useListeningLogs() で全件取得
  → useListeningLogStatistics(logs) で集計
    - 総数 / お気に入り数 / 平均評価
    - 評価分布（1〜5 の件数）
    - 作曲家ランキング（上位 5 件）
    - 月別トレンド（直近 12 ヶ月）
  → ListeningLogStatisticsTemplate に渡して描画
  ※ サーバー API には集計エンドポイントを設けない（クライアント集計）
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

### コンサート記録一覧取得

```text
ブラウザ (/concert-logs)
  → GET /prod/concert-logs
  → API Gateway + Cognito Authorizer
  → Lambda (list.ts)
  → DynamoDB Query GSI1 (userId + createdAt)
  → メモリ内で concertDate 降順にソート
  → ブラウザに返却
```

### コンサート記録作成

```text
ブラウザ (/concert-logs/new)
  → usePieces() で楽曲一覧を取得
  → 楽曲を選択・並べ替え（pieceIds 配列として保持）
  → POST /prod/concert-logs (JSON body: { concertDate, venue, ..., pieceIds })
  → API Gateway + Cognito Authorizer
  → Lambda (create.ts)
  → UUID 生成 + userId (Cognito sub) + createdAt/updatedAt + pieceIds 付与
  → DynamoDB PutItem
  → 201 Created + 作成済みオブジェクト（pieceIds 含む）
  → ブラウザに返却 → /concert-logs へ遷移
```

### 作曲家詳細取得（楽曲一覧付き）

```text
ブラウザ (/composers/[id])
  → useComposer(id) で Composer を取得
  → GET /prod/composers/{id}
  → API Gateway（認証不要）
  → Lambda (get.ts) → DynamoDB GetItem
  → 200 OK + Composer オブジェクト
  → usePiecesAll() で楽曲を全件取得
  → composerId が一致する楽曲のみクライアントサイドで絞り込み
  → ComposerDetailTemplate で「Works」セクションに演奏順インデックス付きで表示
  ※ サーバー API には composerId による絞り込みパラメータなし（クライアント絞り込み）
```

### 楽曲詳細取得（鑑賞記録一覧付き）

```text
ブラウザ (/pieces/[id])
  → usePiece(id) で Piece を取得（認証不要）
  → useComposersAll() で作曲家マスタを取得し composerName を解決
  → useAuth().isAuthenticated() が true の場合のみ:
      → useListeningLogs() で自ユーザーの鑑賞記録を全件取得
      → log.pieceId が設定されていれば log.pieceId === piece.id で絞り込み、
        未設定の旧データは log.composer === composerName && log.piece === piece.title に
        フォールバックしてクライアント絞り込み
      → listenedAt 降順にソート
  → PieceDetailTemplate で「Listening records」セクションに表示し、各エントリは
    /listening-logs/{id} へリンク
  ※ サーバー API には pieceId 絞り込みパラメータなし（全件取得後にクライアント絞り込み）
```

### コンサート記録詳細取得

```text
ブラウザ (/concert-logs/[id])
  → useConcertLog(id) で ConcertLog を取得
  → GET /prod/concert-logs/{id}
  → API Gateway + Cognito Authorizer
  → Lambda (get.ts)
  → DynamoDB GetItem
  → userId が一致するか検証（不一致は 404）
  → 200 OK + コンサート記録オブジェクト（pieceIds 含む）
  → usePieces() で楽曲一覧を取得
  → pieceIds に基づきプログラムを演奏順で表示
```

### コンサート記録更新

```text
ブラウザ (/concert-logs/[id]/edit)
  → useConcertLog(id) で既存記録を取得しフォーム初期値にセット
  → フォーム編集後に useConcertLogs().update(id, values) 実行
  → PUT /prod/concert-logs/{id} (JSON body)
  → API Gateway + Cognito Authorizer
  → Lambda (update.ts)
  → 既存レコード取得 + userId 検証（不一致は 404）
  → updateItem でフィールドを部分更新（楽観的ロック）
  → 200 OK + 更新済みオブジェクト
  → ブラウザに返却 → /concert-logs/{id} へ遷移
```

### コンサート記録削除

```text
ブラウザ (/concert-logs/[id])
  → 「削除」ボタンをクリック → window.confirm() で確認
  → useConcertLogs().deleteLog(id) 実行
  → DELETE /prod/concert-logs/{id}
  → API Gateway + Cognito Authorizer
  → Lambda (delete.ts)
  → 既存レコード取得 + userId 検証（不一致は 404）
  → DynamoDB DeleteItem
  → 204 No Content
  → ブラウザに返却 → /concert-logs へ遷移
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
  - API Gateway Cognito Authorizer による JWT 検証: `/listening-logs/*`・`/concert-logs/*`・`/pieces` の書き込み系（POST/PUT/DELETE）に適用

### 認可（実装済み）

- **状態**: Cognito グループによるロールベースアクセス制御を実装済み（ワーク015-02 / 015-03）
- **実装内容**:
  - `admin` Cognito グループを CDK で全環境に定義（`CfnUserPoolGroup`）。グループ所属ユーザーの ID/Access Token には `cognito:groups: ["admin"]` クレームが付与される
  - 楽曲マスタ書き込み API（`POST /pieces` / `PUT /pieces/{id}` / `DELETE /pieces/{id}`）は `admin` グループのみ実行可能
    - API Gateway の Cognito Authorizer で認証を強制（未認証は 401 Unauthorized）
    - Lambda ハンドラ内の `requireAdmin(event)`（`backend/src/utils/auth.ts`）で `cognito:groups` を検査し、非管理者には 403 Forbidden を返す
  - 楽曲マスタ参照 API（`GET /pieces` / `GET /pieces/{id}`）は認証不要で公開のまま
- **設計上の判断**: Cognito Authorizer にはグループ強制機能が無いため、Authorizer（トークン署名検証）と Lambda 内判定（グループ検査）の二段構えとする
- **運用**: `admin` グループの付与・剥奪は AWS CLI／コンソールによる手動運用。グループ変更は再ログイン後に ID Token に反映される（`docs/OPERATIONS.md` 参照）

### 管理者ロールによる UI 差分（実装済み）

- **状態**: フロントエンド側でも管理者ロールに応じた表示切り替えを実装済み（ワーク015-03）
- **実装内容**:
  - `useAuth` composable の `isAdmin()` 関数が localStorage に保存された ID Token の `cognito:groups` クレームを読み取り、`admin` グループ所属かどうかを返す（JWT の base64url デコードのみ行い、署名検証は行わない）
  - `middleware/admin.ts`: `isAdmin()` が false のとき、保護対象ページ（楽曲マスタ新規作成・編集ページ）にアクセスしようとすると TOP（`/`）へリダイレクトする
  - **TOP ページ**: 管理者のみ「管理者メニュー」セクション（楽曲マスタ追加リンクを含む）を表示する
  - **楽曲マスタ一覧ページ**: 管理者のみ「新しい楽曲」ボタンを表示する
  - **楽曲マスタ詳細ページ**: 管理者のみ「編集」「削除」ボタンを表示する
- **設計上の判断**:
  - クライアント側 UI ガードはあくまで UX 向上のためであり、セキュリティ境界はサーバー側（API の 403 レスポンス）で担保する
  - `isAdmin()` は呼び出し時点の localStorage を読み取るスナップショット関数。ページコンポーネントは各レンダリング時に評価されるため、ログアウト後の再訪問時には正しく false が返る

### DynamoDB Scan による全件取得

- **理由**: シンプルな実装優先、データ量が少ない個人利用想定
- **リスク**: データ量増加時のパフォーマンス・コスト悪化
- **対応予定**: ページネーション・インデックス追加（フェーズ3）

### CORS オリジン制限

- **設定**: prod・stg は CloudFront URL のみ許可。dev 環境のみ `http://localhost:3010` を追加で許可
- **実装**: CDK が各環境に応じた `CORS_ALLOW_ORIGIN` 環境変数を Lambda に設定し、API Gateway プリフライトも同じオリジンに限定

### フロントエンド・バックエンドの型定義が分離

- **理由**: フロントエンド（`types/`）とバックエンド（`backend/src/types/`）が独立したパッケージ構成
- **トレードオフ**: 重複するが、依存関係を分離することでデプロイの独立性を確保

### 楽曲はコンポジット（Work / Movement）

- **状態**: PR1（Issue #640）でドメインモデルを Composite に再設計
- **構造**:
  - `PieceComponent`（抽象基底クラス）: `kind: "work" | "movement"`、`title: PieceTitle`、`videoUrls?: Url[]` を共通プロパティとして公開
  - `PieceWorkEntity extends PieceComponent`: 親楽曲。`composerId: ComposerId` と楽曲カテゴリ（`genre` / `era` / `formation` / `region`）を持つ
  - `PieceMovementEntity extends PieceComponent`: 楽章。`parentId: PieceId` で Work を参照、`index: MovementIndex`（0..999）で演奏順を表す
- **リポジトリ I/F**: `PieceRepository` は **root（Work）操作と子（Movement）操作を明確に分ける**
  - root 限定列挙: `findRootById` / `findRootPage` は Work のみを返す（Movement は除外）
  - kind を問わず単体取得: `findById(id)` は Work / Movement のいずれも返す（更新フローで使用）
  - Movement 一覧は **アグリゲートとして root を取得する API**（PR2 で追加予定。Work と
    Movements をまとめて返す）に集約する。子要素単独の列挙クエリ（`findChildren`）は
    持たない（独立に呼ぶユースケースが無いため）
  - カスケード: `removeWorkCascade(id)` は Work 削除時に配下 Movement もまとめて削除する想定
  - `replaceMovements(workId, movements)` で Movement 集合をアトミック置換（PR3 で実装）
- **バリデーション**: `createPieceSchema` / `updatePieceSchema` は `z.discriminatedUnion("kind", [...])` で Work / Movement を判別する。両 Work / Movement のオブジェクトは `.strict()` で未知フィールドを拒否し、Work に `parentId` / `index` を、Movement に `composerId` / カテゴリ系を含めると 400 を返す
- **PR1 時点の挙動**: 既存 API のレスポンスに `kind: "work"` が増える以外は互換。Movement 専用エンドポイントは追加していない。`DynamoDBPieceRepository` は既存レコード（`kind` を持たない）を読み込み時に `kind: "work"` で正規化することで後方互換を保つ。Movement の永続化は PR2、Movement 集合の REST エンドポイント追加は PR3 で行う
