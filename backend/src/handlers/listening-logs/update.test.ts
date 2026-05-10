import { describe, it, expect, vi, beforeEach } from "vitest";
import { Conflict } from "http-errors";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";

import { handler } from "./update";
import { makeComposer, makeLogRecord, makePiece } from "../../test/fixtures";

const mocks = vi.hoisted(() => ({
  listeningLogRepo: {
    save: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    existsByPieceIds: vi.fn(),
    saveWithOptimisticLock: vi.fn(),
    remove: vi.fn(),
  },
  pieceRepo: {
    findRootById: vi.fn(),
    findRootPage: vi.fn(),
    saveWork: vi.fn(),
    saveWorkWithOptimisticLock: vi.fn(),
    removeWorkCascade: vi.fn(),
    findById: vi.fn(),
    findChildren: vi.fn(),
    saveMovement: vi.fn(),
    saveMovementWithOptimisticLock: vi.fn(),
    removeMovement: vi.fn(),
    replaceMovements: vi.fn(),
  },
  composerRepo: {
    findById: vi.fn(),
    findPage: vi.fn(),
    save: vi.fn(),
    saveWithOptimisticLock: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("../../repositories/listening-log-repository", () => ({
  DynamoDBListeningLogRepository: vi.fn().mockImplementation(function () {
    return mocks.listeningLogRepo;
  }),
}));
vi.mock("../../repositories/piece-repository", () => ({
  DynamoDBPieceRepository: vi.fn().mockImplementation(function () {
    return mocks.pieceRepo;
  }),
}));
vi.mock("../../repositories/composer-repository", () => ({
  DynamoDBComposerRepository: vi.fn().mockImplementation(function () {
    return mocks.composerRepo;
  }),
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

const TEST_USER_ID = "cognito-sub-user-123";
const OTHER_USER_ID = "cognito-sub-other-user";

function makeEvent(id?: string, body?: string | null, userId?: string): APIGatewayProxyEvent {
  return {
    body: body === undefined ? null : body,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "PUT",
    isBase64Encoded: false,
    path: `/listening-logs/${id ?? ""}`,
    pathParameters: id === undefined ? null : { id },
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      authorizer: userId === undefined ? undefined : { claims: { sub: userId } },
    } as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };
}

const existingLog = makeLogRecord("abc-123", "2024-01-15T20:00:00.000Z", TEST_USER_ID);

describe("PUT /listening-logs/:id (update)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pieceRepo.findById.mockResolvedValue(makePiece());
    mocks.composerRepo.findById.mockResolvedValue(makeComposer());
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent(undefined, JSON.stringify({ rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  describe("リクエストボディ異常系", () => {
    it.each<[string | null, number, string]>([
      [null, 400, "Request body is required"],
      ["null", 400, "Request body is required"],
      ["[]", 400, "Request body must be a JSON object"],
      ["invalid json", 422, "Invalid or malformed JSON was provided"],
    ])("body=%j のとき %i を返す", async (body, statusCode, message) => {
      const result = await handler(
        makeEvent("abc-123", body, TEST_USER_ID),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(statusCode);
      expect(JSON.parse(result?.body ?? "{}").message).toBe(message);
    });
  });

  it.each([0, 6, -1, 1.5, "5", null])(
    "rating が不正な値（%s）の場合は 400 を返す",
    async (invalidRating) => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ rating: invalidRating }), TEST_USER_ID),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("rating must be between 1 and 5");
    },
  );

  it("memo が 1000 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ memo: "あ".repeat(1001) }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("memo must be 1000 characters or less");
  });

  it("listenedAt が不正なフォーマットの場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ listenedAt: "2024-01-15" }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
  });

  it("他ユーザーのアイテムを更新しようとした場合は 404 を返す", async () => {
    mocks.listeningLogRepo.findById.mockResolvedValueOnce(existingLog);
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 }), OTHER_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
    expect(mocks.listeningLogRepo.saveWithOptimisticLock).not.toHaveBeenCalled();
  });

  it("userId が null のアイテム（未帰属データ）を更新しようとした場合は 404 を返す", async () => {
    mocks.listeningLogRepo.findById.mockResolvedValueOnce({ ...existingLog, userId: null });
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
    expect(mocks.listeningLogRepo.saveWithOptimisticLock).not.toHaveBeenCalled();
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    mocks.listeningLogRepo.findById.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeEvent("not-found-id", JSON.stringify({ rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
  });

  it("rating を含まない更新は rating のバリデーションをスキップする", async () => {
    mocks.listeningLogRepo.findById.mockResolvedValueOnce(existingLog);
    mocks.listeningLogRepo.saveWithOptimisticLock.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ isFavorite: true }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
  });

  it("正常更新して 200 を返す", async () => {
    mocks.listeningLogRepo.findById.mockResolvedValueOnce(existingLog);
    mocks.listeningLogRepo.saveWithOptimisticLock.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4, isFavorite: true }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBe("abc-123");
    expect(body.rating).toBe(4);
    expect(body.isFavorite).toBe(true);
    // 派生値が結合されている
    expect(body.pieceTitle).toBe("交響曲第5番 ハ短調 Op.67");
    expect(body.composerName).toBe("ベートーヴェン");
  });

  it("updatedAt が更新されること", async () => {
    mocks.listeningLogRepo.findById.mockResolvedValueOnce(existingLog);
    mocks.listeningLogRepo.saveWithOptimisticLock.mockResolvedValueOnce(undefined);

    const before = new Date(existingLog.updatedAt).getTime();
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(new Date(body.updatedAt).getTime()).toBeGreaterThanOrEqual(before);
  });

  it("id は上書きされない", async () => {
    mocks.listeningLogRepo.findById.mockResolvedValueOnce(existingLog);
    mocks.listeningLogRepo.saveWithOptimisticLock.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ id: "tampered-id", rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBe("abc-123");
  });

  it("pieceId を別の UUID に更新できる", async () => {
    mocks.listeningLogRepo.findById.mockResolvedValueOnce(existingLog);
    mocks.listeningLogRepo.saveWithOptimisticLock.mockResolvedValueOnce(undefined);

    const newPieceId = "00000000-0000-4000-8000-00000000aaaa";
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ pieceId: newPieceId }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.pieceId).toBe(newPieceId);
  });

  it("pieceId が UUID 形式でない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ pieceId: "not-a-uuid" }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("pieceId must be a valid UUID");
  });

  it("楽観的ロック競合時に 409 を返す", async () => {
    mocks.listeningLogRepo.findById.mockResolvedValueOnce(existingLog);
    mocks.listeningLogRepo.saveWithOptimisticLock.mockRejectedValueOnce(
      new Conflict("Listening log was updated by another request"),
    );
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(409);
    expect(JSON.parse(result?.body ?? "{}").message).toBe(
      "Listening log was updated by another request",
    );
  });

  it("Repository エラー時に 500 を返す", async () => {
    mocks.listeningLogRepo.findById.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(500);
  });
});
