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

以下の4層に分離する。

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
├── domain/                # ドメインロジック（純粋関数・外部依存なし）
│   ├── piece.ts           #   エンティティ生成、マージ、ソート、フィールドクリア
│   ├── listening-log.ts   #   エンティティ生成、ソート、認可チェック
│   ├── concert-log.ts     #   エンティティ生成、ソート、認可チェック
│   └── auth-error.ts      #   Cognito エラー → アプリケーションエラー変換
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

| 層                | 責務                                                                                                                             | 依存先                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **handlers/**     | HTTPリクエスト解析（Zodバリデーション）、UseCase呼び出し、HTTPレスポンス構築                                                     | usecases/, utils/       |
| **usecases/**     | ユースケース実行。domain と repository を組み合わせてワークフローを実行する                                                      | domain/, repositories/  |
| **domain/**       | エンティティ生成（UUID・日時付与）、マージ、ソート、認可チェック、フィールド削除、エラー変換。純粋関数で構成し外部依存を持たない | なし                    |
| **repositories/** | DynamoDB CRUD操作、Cognito SDK呼び出し。ドメインロジックを含まない                                                               | utils/dynamodb, AWS SDK |
| **utils/**        | ミドルウェア（middy）、バリデーションスキーマ（Zod）、レスポンスヘルパー、認証ユーティリティ                                     | 外部ライブラリのみ      |

### 依存方向

```text
handler → usecase → domain（純粋関数）
                  → repository → DynamoDB / Cognito
         → utils/
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

### domain/

- 1エンティティ1ファイル（純粋関数のみ）
- 外部依存なし（AWS SDK, http-errors 等を import しない）
- エンティティ生成（UUID・日時付与）、マージ、ソート、フィールド削除を担当
- テスト時にモック不要（純粋関数のためそのままテスト可能）

```typescript
// domain/piece.ts の例
export const buildPiece = (input: CreatePieceInput): Piece => {
  const now = new Date().toISOString();
  return { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
};

export const mergePieceUpdate = (current: Piece, input: UpdatePieceInput): Piece => {
  const updated = {
    ...current,
    ...input,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };
  // 空文字フィールドを削除
  for (const key of ["videoUrl", "genre", "era", "formation", "region"] as const) {
    if (input[key] === "") delete updated[key];
  }
  return updated;
};

export const sortPiecesByTitleJa = (pieces: Piece[]): Piece[] =>
  [...pieces].sort((a, b) => a.title.localeCompare(b.title, "ja"));
```

### usecases/

- 1ユースケース1ファイル（関数エクスポート）
- domain と repository を組み合わせてワークフローを実行
- 認可チェック（userId一致検証）はここで実行
- Cognito エラー → アプリケーションエラー変換を担当

```typescript
// usecases/piece/create-piece.ts の例
export const createPiece = async (input: CreatePieceInput): Promise<Piece> => {
  const piece = buildPiece(input);
  await pieceRepository.save(piece);
  return piece;
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

縦割りアプローチで `pieces` → `listening-logs` → `concert-logs` → `auth` の順に完了させる。各機能ドメインで repository → domain → usecase → handler の順に作成する。

### フェーズ 1: pieces のレイヤー化（パターン確立）

- [ ] `repositories/piece-repository.ts` — `findById`, `findAll`, `save`, `saveWithOptimisticLock`, `remove`
- [ ] `domain/piece.ts` — `buildPiece`, `mergePieceUpdate`, `sortPiecesByTitleJa`
- [ ] `usecases/piece/` — CRUD 5ファイル
- [ ] `pieces/*.ts` → `handlers/pieces/*.ts` に移動・スリム化
- [ ] CDK Stack のエントリポイント更新（pieces 5箇所）
- [ ] テスト更新・追加

### フェーズ 2: listening-logs のレイヤー化

- [ ] `repositories/listening-log-repository.ts` — `findById`, `findByUserId`, `save`, `update`, `remove`
- [ ] `domain/listening-log.ts` — `buildListeningLog`, `sortByListenedAtDesc`, `assertOwnership`
- [ ] `usecases/listening-log/` — CRUD 5ファイル
- [ ] `listening-logs/*.ts` → `handlers/listening-logs/*.ts` に移動・スリム化
- [ ] CDK Stack のエントリポイント更新（listening-logs 5箇所）
- [ ] テスト更新・追加

### フェーズ 3: concert-logs のレイヤー化

- [ ] `repositories/concert-log-repository.ts` — `findById`, `findByUserId`, `save`, `update`, `remove`
- [ ] `domain/concert-log.ts` — `buildConcertLog`, `sortByConcertDateDesc`, `assertOwnership`
- [ ] `usecases/concert-log/` — CRUD 5ファイル
- [ ] `concert-logs/*.ts` → `handlers/concert-logs/*.ts` に移動・スリム化
- [ ] CDK Stack のエントリポイント更新（concert-logs 5箇所）
- [ ] テスト更新・追加

### フェーズ 4: auth のレイヤー化

- [ ] `repositories/cognito-auth-repository.ts` — `signUp`, `initiateAuth`, `confirmSignUp`, `resendConfirmationCode`, `refreshToken`
- [ ] `domain/auth-error.ts` — Cognito エラー → アプリケーションエラー変換
- [ ] `usecases/auth/` — 5ファイル
- [ ] `auth/*.ts` → `handlers/auth/*.ts` に移動・スリム化
- [ ] CDK Stack のエントリポイント更新（auth 6箇所）
- [ ] テスト更新・追加

### フェーズ 5: 依存方向の徹底

- [ ] handler → usecase → domain / repository の単方向依存を維持し、逆方向の参照を禁止する
- [ ] ESLint ルール or アーキテクチャテストで依存方向を検証する仕組みを検討

---

## 5. 進め方

**縦割りアプローチ**: `pieces` から先行してパターンを確立し、残りの機能ドメインに展開する。

```text
pieces (repository → domain → usecase → handler) ← 最初にパターン確立
    ↓
listening-logs (repository → domain → usecase → handler)
    ↓
concert-logs (repository → domain → usecase → handler)
    ↓
auth (repository → domain → usecase → handler)
```

各フェーズの完了条件: `pnpm run test:backend` が全件パスすること。

---

## 6. リスクと注意点

| リスク                       | 影響度 | 対策                                                                                              |
| ---------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| CDK エントリポイント変更ミス | 高     | `cdk diff` で Lambda コード変更のみであることを検証。handlers 移動と CDK 更新を同一コミットで行う |
| `vi.mock()` パスの更新漏れ   | 中     | ハンドラー移動後は `vi.mock("../../utils/...")` にパスが変わる。テスト全件パスで漏れを検出        |
| 既存テスト29件の破壊         | 中     | 各フェーズで `pnpm run test:backend` 全件パスを確認してからコミット                               |
| 過度な抽象化                 | 低     | インターフェース定義・DI コンテナは不要。関数エクスポートによる軽量な設計を維持                   |
