import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";

import { handler } from "./get";
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

function makeEvent(id?: string, userId?: string): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "GET",
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

describe("GET /listening-logs/:id (get)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pieceRepo.findById.mockResolvedValue(makePiece());
    mocks.composerRepo.findById.mockResolvedValue(makeComposer());
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(makeEvent(), mockContext, mockCallback);
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    mocks.listeningLogRepo.findById.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeEvent("not-found-id", TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
  });

  it("他ユーザーのアイテムにアクセスした場合は 404 を返す（存在を隠蔽）", async () => {
    mocks.listeningLogRepo.findById.mockResolvedValueOnce(
      makeLogRecord("abc-123", "2024-01-15T20:00:00.000Z", TEST_USER_ID),
    );
    const result = await handler(makeEvent("abc-123", OTHER_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(404);
  });

  it("正常取得して 200 を返す（派生値 pieceTitle / composerName を含む）", async () => {
    mocks.listeningLogRepo.findById.mockResolvedValueOnce(
      makeLogRecord("abc-123", "2024-01-15T20:00:00.000Z", TEST_USER_ID),
    );
    const result = await handler(makeEvent("abc-123", TEST_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBe("abc-123");
    expect(body.pieceTitle).toBe("交響曲第5番 ハ短調 Op.67");
    expect(body.composerName).toBe("ベートーヴェン");
  });

  it("Repository エラー時に 500 を返す", async () => {
    mocks.listeningLogRepo.findById.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeEvent("abc-123", TEST_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
