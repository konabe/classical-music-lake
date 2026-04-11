# バックエンドのレイヤードアーキテクチャ化

## 1. 現状の問題点

現状の各 Lambda ファイルはHTTPパース・ビジネスロジック・DynamoDB操作が1ファイルに混在している。

### 混在の具体例

| ファイル                   | 混在内容                                                             |
| -------------------------- | -------------------------------------------------------------------- |
| `listening-logs/create.ts` | UUID生成・日時付与・オブジェクト構築がハンドラー内                   |
| `listening-logs/list.ts`   | `listenedAt` 降順ソート（ドメインロジック）がハンドラー内            |
| `listening-logs/update.ts` | GetCommand 直接呼び出し + userId 権限チェックがハンドラー内          |
| `pieces/update.ts`         | 空文字フィールド削除ロジック5回繰り返し + 楽観的ロックがハンドラー内 |
| `pieces/list.ts`           | 日本語ロケールソートがハンドラー内                                   |
| `concert-logs/update.ts`   | GetCommand + userId 権限チェックがハンドラー内                       |
| `auth/register.ts`         | Cognito エラー判定3パターンが catch ブロック内                       |
| `auth/login.ts`            | Cognito エラー判定4パターンが catch ブロック内                       |

### DB操作の抽象化状況

`utils/dynamodb.ts` に一部抽象化済みだが不完全:

| 関数                   | 状況                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `queryItemsByUserId()` | 抽象化済み（ページネーション対応）                                                 |
| `scanAllItems()`       | 抽象化済み                                                                         |
| `updateItem()`         | 抽象化済み（楽観的ロック対応）                                                     |
| `getById`              | **未抽象化** — ハンドラー内で `dynamo.send(new GetCommand(...))` を直接呼び出し    |
| `create`               | **未抽象化** — ハンドラー内で `dynamo.send(new PutCommand(...))` を直接呼び出し    |
| `delete`               | **未抽象化** — ハンドラー内で `dynamo.send(new DeleteCommand(...))` を直接呼び出し |

---

## 2. ターゲットアーキテクチャ

以下の3層に分離する。

```text
backend/src/
├── handlers/              # Lambda エントリーポイント（HTTPパース・レスポンス変換のみ）
│   ├── listening-logs/
│   │   ├── create.ts
│   │   ├── list.ts
│   │   ├── get.ts
│   │   ├── update.ts
│   │   └── delete.ts
│   ├── pieces/
│   │   ├── create.ts
│   │   ├── list.ts
│   │   ├── get.ts
│   │   ├── update.ts
│   │   └── delete.ts
│   ├── concert-logs/
│   │   ├── create.ts
│   │   ├── list.ts
│   │   ├── get.ts
│   │   ├── update.ts
│   │   └── delete.ts
│   └── auth/
│       ├── register.ts
│       ├── login.ts
│       ├── verify-email.ts
│       ├── refresh.ts
│       ├── resend-verification-code.ts
│       └── pre-signup.ts
│
├── usecases/              # ビジネスロジック（ドメインルール・バリデーション）
│   ├── listening-log/
│   │   ├── create-listening-log.ts
│   │   ├── list-listening-logs.ts
│   │   ├── get-listening-log.ts
│   │   ├── update-listening-log.ts
│   │   └── delete-listening-log.ts
│   ├── piece/
│   │   ├── create-piece.ts
│   │   ├── list-pieces.ts
│   │   ├── get-piece.ts
│   │   ├── update-piece.ts
│   │   └── delete-piece.ts
│   ├── concert-log/
│   │   ├── create-concert-log.ts
│   │   ├── list-concert-logs.ts
│   │   ├── get-concert-log.ts
│   │   ├── update-concert-log.ts
│   │   └── delete-concert-log.ts
│   └── auth/
│       ├── register-user.ts
│       ├── login-user.ts
│       ├── verify-email.ts
│       ├── refresh-token.ts
│       └── resend-verification-code.ts
│
├── repositories/          # DynamoDB / Cognito アクセス（データ永続化・外部サービス呼び出しのみ）
│   ├── listening-log-repository.ts
│   ├── piece-repository.ts
│   ├── concert-log-repository.ts
│   └── cognito-auth-repository.ts
│
├── utils/                 # 横断的関心事（既存を維持）
│   ├── middleware.ts
│   ├── schemas.ts
│   ├── response.ts
│   ├── auth.ts
│   ├── env.ts
│   ├── parsing.ts
│   └── path-params.ts
│
├── types/                 # 型定義（既存を維持）
└── test/                  # テスト補助（既存を維持）
```

### 各層の責務

| 層                | 責務                                                                                                                                          | 依存先                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **handlers/**     | HTTPリクエスト解析（Zodバリデーション）、UseCase呼び出し、HTTPレスポンス構築                                                                  | usecases/, utils/       |
| **usecases/**     | ユースケース実行、認可チェック（userId一致検証）、エンティティ生成（UUID・日時付与）、ソート、フィールド削除ロジック、Cognitoエラーマッピング | repositories/           |
| **repositories/** | DynamoDB CRUD操作、Cognito SDK呼び出し。ドメインロジックを含まない                                                                            | utils/dynamodb, AWS SDK |
| **utils/**        | ミドルウェア（middy）、バリデーションスキーマ（Zod）、レスポンスヘルパー、認証ユーティリティ                                                  | 外部ライブラリのみ      |

### 依存方向

```text
handler → usecase → repository → DynamoDB / Cognito
                  ↘ utils/
```

逆方向の参照を禁止する。

---

## 3. 各層の設計方針

### repositories/

- 1エンティティ1ファイル
- `utils/dynamodb.ts` の既存ヘルパー（`queryItemsByUserId`, `scanAllItems`, `updateItem`）を活用
- 未抽象化の操作（`findById`, `save`, `remove`）を追加
- Cognito SDK 操作は `cognito-auth-repository.ts` に集約
- DI コンテナは使わず、モジュールレベルでインスタンスを生成する

```typescript
// repositories/listening-log-repository.ts の例
export const findById = async (id: string): Promise<ListeningLog | undefined> => { ... };
export const findByUserId = async (userId: string): Promise<ListeningLog[]> => { ... };
export const save = async (item: ListeningLog): Promise<void> => { ... };
export const update = async (id: string, input: Partial<ListeningLog>): Promise<ListeningLog> => { ... };
export const remove = async (id: string): Promise<void> => { ... };
```

### usecases/

- 1ユースケース1ファイル（関数エクスポート）
- エンティティ生成ロジック（UUID・日時付与・オブジェクト構築）を担当
- 認可チェック（userId一致検証）を担当
- ソートロジック（`listenedAt` 降順、日本語ロケールソート等）を担当
- `pieces/update` の空文字フィールド削除ロジックを担当
- Cognito エラー → アプリケーションエラー変換を担当

```typescript
// usecases/listening-log/create-listening-log.ts の例
export const createListeningLog = async (
  input: CreateListeningLogInput,
  userId: string
): Promise<ListeningLog> => {
  const now = new Date().toISOString();
  const item: ListeningLog = {
    ...input,
    id: randomUUID(),
    userId,
    createdAt: now,
    updatedAt: now,
  };
  await repository.save(item);
  return item;
};
```

### handlers/

- 既存の1ファイル1エンドポイントパターンを維持
- `createHandler()`（middy）、`parseRequestBody()`、`getUserId()` は引き続き使用
- ビジネスロジックを含まない薄いアダプター

```typescript
// handlers/listening-logs/create.ts の例
export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, createListeningLogSchema);
  const userId = getUserId(event);
  const log = await createListeningLog(input, userId);
  return { statusCode: StatusCodes.CREATED, body: log };
}).use(jsonBodyParser);
```

### 特殊ケース

- `auth/pre-signup.ts` は `PreSignUpTriggerHandler` 型を使用しており、middy の `createHandler` を使わない。UseCase層を経由させず、そのまま `handlers/auth/` に配置する

---

## 4. フェーズ計画

### フェーズ 1: repositories/ 層の作成

DynamoDB / Cognito 操作をハンドラーから分離し、Repository に集約する。

対象:

- [ ] `repositories/listening-log-repository.ts` — `findById`, `findByUserId`, `save`, `update`, `remove`
- [ ] `repositories/piece-repository.ts` — `findById`, `findAll`, `save`, `saveWithOptimisticLock`, `remove`
- [ ] `repositories/concert-log-repository.ts` — `findById`, `findByUserId`, `save`, `update`, `remove`
- [ ] `repositories/cognito-auth-repository.ts` — `signUp`, `initiateAuth`, `confirmSignUp`, `resendConfirmationCode`, `refreshToken`
- [ ] Repository 層のユニットテスト追加

### フェーズ 2: usecases/ 層の作成

ビジネスロジックをハンドラーから分離し、UseCase に集約する。

対象:

- [ ] `usecases/listening-log/` — CRUD 5ファイル（UUID生成、日時付与、userId検証、ソート）
- [ ] `usecases/piece/` — CRUD 5ファイル（UUID生成、日時付与、空文字フィールド削除、日本語ソート）
- [ ] `usecases/concert-log/` — CRUD 5ファイル（UUID生成、日時付与、userId検証、ソート）
- [ ] `usecases/auth/` — 5ファイル（Cognito エラーマッピング集約）
- [ ] UseCase 層のユニットテスト追加（Repository をモック）

### フェーズ 3: handlers/ 層のスリム化 + CDK パス変更

既存の Lambda ファイルを `handlers/` に移動し、UseCase 呼び出しのみに絞る。

対象:

- [ ] `listening-logs/*.ts` → `handlers/listening-logs/*.ts` に移動・スリム化
- [ ] `pieces/*.ts` → `handlers/pieces/*.ts` に移動・スリム化
- [ ] `concert-logs/*.ts` → `handlers/concert-logs/*.ts` に移動・スリム化
- [ ] `auth/*.ts` → `handlers/auth/*.ts` に移動・スリム化
- [ ] CDK Stack のエントリポイント更新（全21箇所）
- [ ] 既存テストの import パス更新 + モック対象を Repository/UseCase に変更
- [ ] 旧ディレクトリの削除

### フェーズ 4: 依存方向の徹底

- [ ] handler → usecase → repository の単方向依存を維持し、逆方向の参照を禁止する
- [ ] ESLint ルール or アーキテクチャテストで依存方向を検証する仕組みを検討

---

## 5. 進め方

**縦割りアプローチ**: 1つの機能ドメイン（例: `listening-logs`）をフェーズ1〜3まで先行して完了させ、パターンを確立してから残りの機能ドメインに展開する。

```text
listening-logs (repository → usecase → handler) ← 最初にパターン確立
    ↓
pieces (repository → usecase → handler)
    ↓
concert-logs (repository → usecase → handler)
    ↓
auth (repository → usecase → handler)
```

各フェーズの完了条件: `pnpm run test:backend` が全件パスすること。

---

## 6. リスクと注意点

| リスク                       | 影響度 | 対策                                                                                                          |
| ---------------------------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| CDK エントリポイント変更ミス | 高     | `cdk diff` で Lambda コード変更のみであることを検証。フェーズ3で handlers 移動と CDK 更新を同一コミットで行う |
| `vi.mock()` パスの更新漏れ   | 中     | ハンドラー移動後は `vi.mock("../../utils/...")` にパスが変わる。テスト全件パスで漏れを検出                    |
| 既存テスト29件の破壊         | 中     | フェーズ1・2は新規ファイル追加のみで既存コードに触れない。フェーズ3で一括更新                                 |
| 過度な抽象化                 | 低     | インターフェース定義・DI コンテナは不要。関数エクスポートによる軽量な設計を維持                               |
