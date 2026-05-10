import { describe, it, expect, vi } from "vitest";
import type { Composer, ListeningLog, ListeningLogRecord, Piece } from "../types";
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
    findChildren: vi.fn().mockResolvedValue([]),
    saveMovement: vi.fn(),
    saveMovementWithOptimisticLock: vi.fn(),
    removeMovement: vi.fn(),
    replaceMovements: vi.fn(),
  };
  const composerRepo = {
    findById: vi.fn().mockResolvedValue(makeComposer()),
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

export const describeInvalidBodyCases = (handler: HandlerFn, path: string) => {
  describe("リクエストボディ異常系", () => {
    it.each<[string | null, number, string]>([
      [null, 400, "Request body is required"],
      ["null", 400, "Request body is required"],
      ["[]", 400, "Request body must be a JSON object"],
      ["invalid json", 422, "Invalid or malformed JSON was provided"],
    ])("body=%j のとき %i を返す", async (body, statusCode, message) => {
      const result = await handler(
        makeEvent({ body, httpMethod: "POST", path }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(statusCode);
      expect(JSON.parse(result?.body ?? "{}").message).toBe(message);
    });
  });
};
