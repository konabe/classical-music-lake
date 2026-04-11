import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import type { ListeningLog } from "../types";

import { handler } from "./get";
import { dynamo } from "../utils/dynamodb";

vi.mock("../utils/dynamodb", () => ({
  dynamo: { send: vi.fn() },
  TABLE_LISTENING_LOGS: "test-listening-logs",
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

const testLog: ListeningLog = {
  id: "abc-123",
  userId: TEST_USER_ID,
  listenedAt: "2024-01-15T20:00:00.000Z",
  composer: "ベートーヴェン",
  piece: "交響曲第9番",
  rating: 5,
  isFavorite: true,
  memo: "素晴らしい演奏",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("GET /listening-logs/:id (get)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(makeEvent(), mockContext, mockCallback);
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({ Item: undefined } as never);
    const result = await handler(
      makeEvent("not-found-id", TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(404);
  });

  it("他ユーザーのアイテムにアクセスした場合は 404 を返す（存在を隠蔽）", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({ Item: testLog } as never);
    const result = await handler(makeEvent("abc-123", OTHER_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(404);
  });

  it("userId が null のアイテム（未帰属データ）にアクセスした場合は 404 を返す", async () => {
    const nullUserLog = { ...testLog, userId: null };
    vi.mocked(dynamo.send).mockResolvedValueOnce({ Item: nullUserLog } as never);
    const result = await handler(makeEvent("abc-123", TEST_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(404);
  });

  it("正常取得して 200 を返す", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({ Item: testLog } as never);
    const result = await handler(makeEvent("abc-123", TEST_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBe("abc-123");
    expect(body.piece).toBe("交響曲第9番");
  });

  it("DynamoDB エラー時に 500 を返す", async () => {
    vi.mocked(dynamo.send).mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeEvent("abc-123", TEST_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
