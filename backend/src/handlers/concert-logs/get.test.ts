import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import type { ConcertLog } from "../../types";

import { handler } from "./get";

const mockRepo = vi.hoisted(() => ({
  save: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("../../repositories/concert-log-repository", () => ({
  DynamoDBConcertLogRepository: vi.fn().mockImplementation(function () {
    return mockRepo;
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
    path: `/concert-logs/${id ?? ""}`,
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

const testLog: ConcertLog = {
  id: "abc-123",
  userId: TEST_USER_ID,
  title: "定期演奏会 第100回",
  concertDate: "2024-01-15T19:00:00.000Z",
  venue: "サントリーホール",
  conductor: "小澤征爾",
  orchestra: "ベルリン・フィルハーモニー管弦楽団",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("GET /concert-logs/:id (get)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(makeEvent(), mockContext, mockCallback);
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    mockRepo.findById.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeEvent("not-found-id", TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(404);
  });

  it("他ユーザーのアイテムにアクセスした場合は 404 を返す（存在を隠蔽）", async () => {
    mockRepo.findById.mockResolvedValueOnce(testLog);
    const result = await handler(makeEvent("abc-123", OTHER_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(404);
  });

  it("正常取得して 200 を返す", async () => {
    mockRepo.findById.mockResolvedValueOnce(testLog);
    const result = await handler(makeEvent("abc-123", TEST_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBe("abc-123");
    expect(body.venue).toBe("サントリーホール");
    expect(body.conductor).toBe("小澤征爾");
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockRepo.findById.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeEvent("abc-123", TEST_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });

  it("pieceIds を含むログを正常取得して 200 を返す", async () => {
    const pieceId = "550e8400-e29b-41d4-a716-446655440000";
    mockRepo.findById.mockResolvedValueOnce({
      ...testLog,
      pieceIds: [pieceId],
    });
    const result = await handler(makeEvent("abc-123", TEST_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.pieceIds).toEqual([pieceId]);
  });
});
