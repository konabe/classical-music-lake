---
name: write-unit-test
description: バックエンド／フロントエンドのユニットテストを Vitest で書く。新規テスト作成・既存テストのリファクタリングのいずれにも使う。
---

# Vitest ユニットテスト作成ガイド

## 1. プロジェクトの前提

- **テストフレームワーク**: Vitest（`globals: true` 有効）。`describe` / `it` / `expect` / `vi` / `beforeEach` などは**明示的 import 禁止**（ESLint で error）
- **テストファイル配置**: 実装ファイルと同じディレクトリに `*.test.ts` で併置
- **テスト名は日本語**で書く（例: `it("メールアドレスが無効な場合は 400 を返す", ...)`）
- **AAA パターン**（Arrange / Act / Assert）を意識する

## 2. 共通フィクスチャを使う（重複を避ける）

`backend/src/test/fixtures.ts` に集約されたヘルパーを必ず先に確認し、流用する。

| ヘルパー | 用途 |
|---------|------|
| `makeEvent(overrides)` | `APIGatewayProxyEvent` のテンプレート |
| `makeAuthEvent(userId, overrides, groups?)` | 認証済みイベント |
| `makeAdminEvent(userId, overrides)` | admin グループ付きイベント |
| `makeDeleteEvent(prefix, id, userId)` | DELETE 用 |
| `mockContext` / `mockCallback` | Lambda context/callback のスタブ |
| `makeListeningLogRepoMocks()` | ListeningLog 系リポジトリのモック群（既定値付き） |
| `makeCognitoError(name, message?)` | Cognito 例外オブジェクトの生成 |
| `describeInvalidBodyCases(handler, path)` | 共通のボディ異常系テスト（null / "null" / "[]" / "invalid json"） |
| `makeLogRecord` / `makeLog` / `makePiece` / `makeComposer` | DTO・エンティティのファクトリー |

**新しい共通パターンに気づいたら fixtures に追加してから使う**。各ファイルに同じヘルパーを定義しない。

## 3. モックの集約パターン

### 3.1 ハンドラがリポジトリを内部 `new` する場合

`__mocks__/` ディレクトリで auto-mock を一元定義する。例: `backend/src/repositories/__mocks__/cognito-auth-repository.ts`

```typescript
// __mocks__/cognito-auth-repository.ts
export const mockCognitoAuthRepo = {
  signUp: vi.fn(),
  initiateAuth: vi.fn(),
  // ...全メソッド
};

export const CognitoAuthRepository = vi.fn().mockImplementation(function () {
  return mockCognitoAuthRepo;
});
```

テスト側：

```typescript
import { mockCognitoAuthRepo as mockRepo } from "@/repositories/__mocks__/cognito-auth-repository";

vi.mock("@/repositories/cognito-auth-repository"); // factory なしで __mocks__ を自動使用
```

**`vi.hoisted()` + `vi.mock()` の factory パターンは新規では使わない**。複数ファイルで重複したら必ず `__mocks__/` に移す。

### 3.2 usecase が依存を constructor 引数で受け取る場合

`makeXxxRepoMocks()` を呼び出して直接渡す。`vi.mock()` 不要。

## 4. ボイラープレート削減のヘルパー

### 4.1 エンドポイント単位のイベントファクトリー

`makeEvent({ body: JSON.stringify(...), httpMethod, path })` が3回以上現れたら、ファイル冒頭に `makeXxxEvent` を抽出する：

```typescript
const validInput = { email: "user@example.com", password: "ValidPassword123" };

const makeLoginEvent = (body: object = validInput) =>
  makeEvent({ body: JSON.stringify(body), httpMethod: "POST", path: "/auth/login" });
```

### 4.2 エラーオブジェクト生成

Cognito 例外は `makeCognitoError("NotAuthorizedException")` を使う（fixtures から import）。

## 5. `it.each` で類似ケースを統合

**判断基準**: ステータスコード／入力／期待結果だけが違うテストが3つ以上並んだら `it.each` にまとめる。

### 5.1 Cognito エラー系（推奨形）

```typescript
describe("Cognito エラー系", () => {
  it.each<[string, number, string | undefined]>([
    ["NotAuthorizedException", 401, "InvalidCredentials"],
    ["UserNotFoundException", 401, "InvalidCredentials"],
    ["UserNotConfirmedException", 403, "UserNotConfirmed"],
    ["TooManyRequestsException", 429, "TooManyRequests"],
    ["ServiceUnavailableException", 500, undefined],
  ])("%s のとき %i を返す", async (name, statusCode, errorCode) => {
    mockRepo.initiateAuth.mockRejectedValueOnce(makeCognitoError(name));
    const result = await handler(makeLoginEvent(), mockContext, mockCallback);
    expect(result?.statusCode).toBe(statusCode);
    if (errorCode !== undefined) {
      expect(JSON.parse(result?.body ?? "{}").error).toBe(errorCode);
    }
  });
});
```

### 5.2 バリデーション

```typescript
it.each([
  [{ ...validInput, email: "invalid-email" }, "email"],
  [{ ...validInput, password: "" }, "password"],
])("不正な入力 %o は 400 を返す", async (body, field) => { ... });

// 必須欠落だけは body の中身が型違いなので別の it.each に
it.each([
  [{ password: validInput.password }],
  [{ email: validInput.email }],
])("必須フィールドが欠けている場合は 400 を返す: %o", async (body) => { ... });
```

**注意点**:
- タプル要素数 = コールバック引数の数。未使用要素は削除する（型エラーになる）
- アサーションが大きく違う場合は無理に統合しない。`message.toContain("password")` のような個別アサーションが必要なケースは個別 `it` のまま残す

## 6. テスト構造

```typescript
describe("POST /auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describeInvalidBodyCases(handler, "/auth/login"); // 共通の異常系

  describe("バリデーション", () => { ... });
  describe("成功系", () => { ... });
  describe("Cognito エラー系", () => { ... });
});
```

- **`describe` は意味のある単位でまとめる**。「メールバリデーション」「パスワードバリデーション」「必須フィールド検証」は1つの `describe("バリデーション")` で十分なことが多い
- **`beforeEach(vi.clearAllMocks)`** は必ず入れる
- **`mockResolvedValueOnce` / `mockRejectedValueOnce`** を使う（once でテスト間の汚染を防ぐ）

## 7. アサーション

- `toBeTruthy` / `toBeFalsy` は ESLint で禁止。`toBeDefined()` / `toBeUndefined()` など明示的なマッチャーを使う
- カスタムマッチャー `toBeUUID()` が利用可能（`backend/src/test/vitest.d.ts`）

## 8. 実行コマンド

```bash
# バックエンド全体
cd backend && pnpm test

# 特定ファイル
cd backend && pnpm test src/handlers/auth/login.test.ts

# フロントエンド
pnpm run test:frontend
```

## 9. リファクタリングの判断順序

新規ではなく既存テストを書き換える場合：

1. **共通フィクスチャに移せるものを探す** — 複数ファイルで同じ helper が定義されていたら fixtures に移動
2. **モック定義を集約** — `vi.hoisted()` + `vi.mock()` の同一 factory が複数ファイルに散らばっていたら `__mocks__/` に
3. **ファイル内ヘルパーを抽出** — 同一エンドポイントへの `makeEvent` 呼び出しが3回以上あれば `makeXxxEvent` に
4. **`it.each` 化** — 構造が同じテストが3つ以上並んだら統合
5. **`describe` のフラット化** — 意味的に近い小さな `describe` をまとめる
