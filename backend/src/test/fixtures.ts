import { describe, it, expect, vi, type Mock } from "vitest";
import type { Composer, ListeningLog, ListeningLogRecord, Piece } from "@/types";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";

export const TEST_COMPOSER_ID = "00000000-0000-4000-8000-000000000001";
export const TEST_PIECE_ID = "00000000-0000-4000-8000-000000000002";

/**
 * 永続化用 ListeningLog レコード（pieceId のみ、派生値を含まない）。
 * リポジトリ層のモック戻り値に使用する。
 */
export const makeLogRecord = (
  id: string,
  listenedAt: string,
  userId: string | null = "user-123",
  pieceId: string = TEST_PIECE_ID,
): ListeningLogRecord => ({
  id,
  listenedAt,
  userId,
  pieceId,
  rating: 4,
  isFavorite: false,
  memo: "カラヤン指揮、ベルリン・フィル。第1楽章の緊張感が素晴らしい。",
  createdAt: "2024-06-01T09:00:00.000Z",
  updatedAt: "2024-06-01T09:00:00.000Z",
});

/**
 * API レスポンス用の ListeningLog DTO（派生値 pieceTitle / composerId / composerName を含む）。
 * ハンドラ層のレスポンス比較に使用する。
 */
export const makeLog = (
  id: string,
  listenedAt: string,
  userId: string | null = "user-123",
  pieceId: string = TEST_PIECE_ID,
): ListeningLog => ({
  ...makeLogRecord(id, listenedAt, userId, pieceId),
  pieceTitle: "交響曲第5番 ハ短調 Op.67",
  composerId: TEST_COMPOSER_ID,
  composerName: "ベートーヴェン",
});

export const makePiece = (
  id: string = TEST_PIECE_ID,
  title: string = "交響曲第5番 ハ短調 Op.67",
  composerId?: string,
): Piece => ({
  kind: "work",
  id,
  title,
  composerId: composerId ?? TEST_COMPOSER_ID,
  createdAt: "2024-06-01T09:00:00.000Z",
  updatedAt: "2024-06-01T09:00:00.000Z",
});

export const makeComposer = (
  id: string = TEST_COMPOSER_ID,
  name: string = "ベートーヴェン",
): Composer => ({
  id,
  name,
  createdAt: "2024-06-01T09:00:00.000Z",
  updatedAt: "2024-06-01T09:00:00.000Z",
});

export const makeEvent = (overrides?: Partial<APIGatewayProxyEvent>): APIGatewayProxyEvent => ({
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: "GET",
  isBase64Encoded: false,
  path: "/",
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {} as APIGatewayProxyEvent["requestContext"],
  resource: "",
  ...overrides,
});

export const makeAuthEvent = (
  userId: string,
  overrides?: Partial<APIGatewayProxyEvent>,
  groups?: string[] | string,
): APIGatewayProxyEvent => {
  const claims: Record<string, unknown> = { sub: userId };
  if (groups !== undefined) {
    claims["cognito:groups"] = groups;
  }
  return {
    ...makeEvent(overrides),
    requestContext: {
      authorizer: { claims },
    } as unknown as APIGatewayProxyEvent["requestContext"],
  };
};

export const makeAdminEvent = (
  userId: string,
  overrides?: Partial<APIGatewayProxyEvent>,
): APIGatewayProxyEvent => makeAuthEvent(userId, overrides, ["admin"]);

export const mockContext: Context = {} as Context;
export const mockCallback = { signal: new AbortController().signal };

export const TEST_USER_ID = "cognito-sub-user-123";
export const OTHER_USER_ID = "cognito-sub-other-user";

export const makeDeleteEvent = (
  pathPrefix: string,
  id?: string,
  userId?: string,
): APIGatewayProxyEvent => ({
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: "DELETE",
  isBase64Encoded: false,
  path: `/${pathPrefix}/${id ?? ""}`,
  pathParameters: id === undefined ? null : { id },
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {
    authorizer: userId === undefined ? undefined : { claims: { sub: userId } },
  } as APIGatewayProxyEvent["requestContext"],
  resource: "",
});

/**
 * 参照系ハンドラ（GET /{prefix}/{id}）のイベントを生成する。
 * `userId` を渡すとユーザースコープの authorizer クレームを付与する（参照公開系では省略）。
 */
export const makeGetEvent = (
  pathPrefix: string,
  id?: string,
  userId?: string,
): APIGatewayProxyEvent => ({
  ...makeEvent({
    httpMethod: "GET",
    path: `/${pathPrefix}/${id ?? ""}`,
    pathParameters: id === undefined ? null : { id },
  }),
  requestContext: {
    authorizer: userId === undefined ? undefined : { claims: { sub: userId } },
  } as APIGatewayProxyEvent["requestContext"],
});

/**
 * admin 限定の書き込み系ハンドラで、認可状態を切り替えてイベントを生成するための区分。
 * - `admin`: admin グループ所属の認証済みユーザー
 * - `non-admin`: 認証済みだが admin グループ非所属
 * - `none`: 認証クレームなし
 */
export type WriteAuthMode = "admin" | "non-admin" | "none";

/**
 * 認可区分に応じて admin / 非 admin / 認証なしのイベントを生成する。
 * admin 書き込み系のうち、パスが定型でないエンドポイント（例: PUT /pieces/{id}/movements）でも
 * overrides を直接組み立てて再利用できる。
 */
export const makeWriteEvent = (
  overrides: Partial<APIGatewayProxyEvent>,
  auth: WriteAuthMode,
): APIGatewayProxyEvent => {
  if (auth === "admin") {
    return makeAdminEvent(TEST_USER_ID, overrides);
  }
  if (auth === "non-admin") {
    return makeAuthEvent(TEST_USER_ID, overrides);
  }
  return makeEvent(overrides);
};

export const makeAdminPutEvent = (
  pathPrefix: string,
  id?: string,
  body?: string | null,
  auth: WriteAuthMode = "admin",
): APIGatewayProxyEvent =>
  makeWriteEvent(
    {
      body: body === undefined ? null : body,
      httpMethod: "PUT",
      path: `/${pathPrefix}/${id ?? ""}`,
      pathParameters: id === undefined ? null : { id },
    },
    auth,
  );

export const makeAdminDeleteEvent = (
  pathPrefix: string,
  id: string | null,
  auth: WriteAuthMode = "admin",
): APIGatewayProxyEvent =>
  makeWriteEvent(
    {
      httpMethod: "DELETE",
      path: `/${pathPrefix}/${id ?? ""}`,
      pathParameters: id === null ? null : { id },
    },
    auth,
  );

/**
 * ユーザースコープの更新系ハンドラ（PUT /{prefix}/{id}）のイベントを生成する。
 * `userId` を渡すと authorizer クレームを付与する。
 */
export const makeUserPutEvent = (
  pathPrefix: string,
  id?: string,
  body?: string | null,
  userId?: string,
): APIGatewayProxyEvent => ({
  ...makeEvent({
    body: body === undefined ? null : body,
    httpMethod: "PUT",
    path: `/${pathPrefix}/${id ?? ""}`,
    pathParameters: id === undefined ? null : { id },
  }),
  requestContext: {
    authorizer: userId === undefined ? undefined : { claims: { sub: userId } },
  } as APIGatewayProxyEvent["requestContext"],
});

/**
 * ListeningLog 系ハンドラ／ユースケースのテストで使うリポジトリモック群を生成する。
 * ListeningLogUsecase が `pieceRepo.findById` / `composerRepo.findById` を呼ぶため、
 * これらの戻り値も既定で fixture から提供する（必要に応じて override 可能）。
 */
export const makeListeningLogRepoMocks = () => {
  const listeningLogRepo = {
    save: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    existsByPieceIds: vi.fn().mockResolvedValue(false),
    saveWithOptimisticLock: vi.fn(),
    remove: vi.fn(),
  };
  const pieceRepo = {
    findRootById: vi.fn().mockResolvedValue(makePiece()),
    findRootPage: vi.fn(),
    saveWork: vi.fn(),
    saveWorkWithOptimisticLock: vi.fn(),
    removeWorkCascade: vi.fn(),
    findById: vi.fn().mockResolvedValue(makePiece()),
    findByIds: vi
      .fn()
      .mockImplementation(async (ids: { value: string }[]) =>
        ids.length === 0 ? [] : [makePiece()],
      ),
    findChildren: vi.fn().mockResolvedValue([]),
    saveMovement: vi.fn(),
    saveMovementWithOptimisticLock: vi.fn(),
    removeMovement: vi.fn(),
    replaceMovements: vi.fn(),
  };
  const composerRepo = {
    findById: vi.fn().mockResolvedValue(makeComposer()),
    findByIds: vi
      .fn()
      .mockImplementation(async (ids: { value: string }[]) =>
        ids.length === 0 ? [] : [makeComposer()],
      ),
    findPage: vi.fn(),
    save: vi.fn(),
    saveWithOptimisticLock: vi.fn(),
    remove: vi.fn(),
  };
  return { listeningLogRepo, pieceRepo, composerRepo };
};

type HandlerFn = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: unknown,
) => Promise<{ statusCode?: number; body?: string } | null | undefined>;

export const makeCognitoError = (name: string, message = "error") =>
  Object.assign(new Error(message), { name });

/**
 * Cognito 例外を投げたときのハンドラ応答（ステータスコードと error / message）を
 * テーブル駆動で検証する。auth 系ハンドラに共通する「Cognito エラー系」ブロックを共通化する。
 *
 * - `error`: レスポンスボディの `error` フィールドの完全一致を検証する
 * - `messageIncludes`: レスポンスボディの `message` の部分一致を検証する（大文字小文字を無視）
 */
type CognitoErrorCase = {
  name: string;
  statusCode: number;
  error?: string;
  messageIncludes?: string;
};

export const describeCognitoErrorCases = (
  mockMethod: Mock,
  invoke: () => Promise<{ statusCode?: number; body?: string } | null | undefined>,
  cases: CognitoErrorCase[],
) => {
  describe("Cognito エラー系", () => {
    it.each(cases)(
      "$name のとき $statusCode を返す",
      async ({ name, statusCode, error, messageIncludes }) => {
        mockMethod.mockRejectedValueOnce(makeCognitoError(name));

        const result = await invoke();

        expect(result?.statusCode).toBe(statusCode);
        const body = JSON.parse(result?.body ?? "{}");
        if (error !== undefined) {
          expect(body.error).toBe(error);
        }
        if (messageIncludes !== undefined) {
          expect(String(body.message).toLowerCase()).toContain(messageIncludes.toLowerCase());
        }
      },
    );
  });
};

/**
 * リクエストボディの欠落・型不正・JSON 破損に対するハンドラ応答を共通検証する。
 * 既定では認証なしの POST イベントを使うが、admin 必須エンドポイントや PUT など
 * 別のイベント生成が必要な場合は `makeBodyEvent` でファクトリを差し替える。
 */
export const describeInvalidBodyCases = (
  handler: HandlerFn,
  path: string,
  makeBodyEvent: (body: string | null) => APIGatewayProxyEvent = (body) =>
    makeEvent({ body, httpMethod: "POST", path }),
) => {
  describe("リクエストボディ異常系", () => {
    it.each<[string | null, number, string]>([
      [null, 400, "Request body is required"],
      ["null", 400, "Request body is required"],
      ["[]", 400, "Request body must be a JSON object"],
      ["invalid json", 422, "Invalid or malformed JSON was provided"],
    ])("body=%j のとき %i を返す", async (body, statusCode, message) => {
      const result = await handler(makeBodyEvent(body), mockContext, mockCallback);
      expect(result?.statusCode).toBe(statusCode);
      expect(JSON.parse(result?.body ?? "{}").message).toBe(message);
    });
  });
};

/**
 * admin 限定の書き込み系ハンドラに共通する「認可」ブロックを共通化する。
 * 非 admin・認証クレームなしのいずれでも 403 を返し、副作用（リポジトリ書き込み等）が
 * 起きないことを検証する。`invoke` は認可区分を受け取りハンドラを呼び出す。
 */
type HandlerResult = { statusCode?: number; body?: string } | null | undefined;

export const describeAdminForbiddenCases = (
  invoke: (auth: "non-admin" | "none") => HandlerResult | Promise<HandlerResult>,
  notCalledMocks: Mock[],
) => {
  describe("認可", () => {
    it("admin グループに属さないユーザーは 403 を返し、副作用を起こさない", async () => {
      const result = await invoke("non-admin");
      expect(result?.statusCode).toBe(403);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("Admin privilege required");
      notCalledMocks.forEach((mock) => expect(mock).not.toHaveBeenCalled());
    });

    it("認証クレームがない場合は 403 を返し、副作用を起こさない", async () => {
      const result = await invoke("none");
      expect(result?.statusCode).toBe(403);
      notCalledMocks.forEach((mock) => expect(mock).not.toHaveBeenCalled());
    });
  });
};
