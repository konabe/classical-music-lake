import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";

import { handler } from "./delete";
import { dynamo } from "../utils/dynamodb";

vi.mock("../utils/dynamodb", () => ({
  dynamo: { send: vi.fn() },
  TABLE_CONCERT_LOGS: "test-concert-logs",
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
    httpMethod: "DELETE",
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

const existingItem = {
  id: "abc-123",
  userId: TEST_USER_ID,
  title: "定期演奏会 第100回",
  concertDate: "2024-01-15T19:00:00.000Z",
  venue: "サントリーホール",
  conductor: "小澤征爾",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("DELETE /concert-logs/:id (delete)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(makeEvent(undefined, TEST_USER_ID), mockContext, mockCallback);
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

  it("他ユーザーのアイテムを削除しようとした場合は 404 を返す（存在を隠蔽）", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({ Item: existingItem } as never);
    const result = await handler(makeEvent("abc-123", OTHER_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(404);
    expect(vi.mocked(dynamo.send)).toHaveBeenCalledTimes(1); // DeleteCommand は呼ばれない
  });

  it("正常削除して 204 を返す", async () => {
    vi.mocked(dynamo.send)
      .mockResolvedValueOnce({ Item: existingItem } as never) // GetCommand
      .mockResolvedValueOnce({} as never); // DeleteCommand
    const result = await handler(makeEvent("abc-123", TEST_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(204);
    expect(result?.body).toBe("");
    expect(vi.mocked(dynamo.send)).toHaveBeenCalledTimes(2);
  });

  it("DynamoDB エラー時に 500 を返す", async () => {
    vi.mocked(dynamo.send).mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeEvent("abc-123", TEST_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
