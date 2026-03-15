import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import type { ListeningLog } from "../types";

import { handler } from "./update";
import { dynamo } from "../utils/dynamodb";

vi.mock("../utils/dynamodb", () => ({
  dynamo: { send: vi.fn() },
  TABLE_LISTENING_LOGS: "test-listening-logs",
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

function makeEvent(id?: string, body?: string | null): APIGatewayProxyEvent {
  return {
    body: body !== undefined ? body : null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "PUT",
    isBase64Encoded: false,
    path: `/listening-logs/${id ?? ""}`,
    pathParameters: id ? { id } : null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };
}

const existingLog: ListeningLog = {
  id: "abc-123",
  listenedAt: "2024-01-15T20:00:00.000Z",
  composer: "ベートーヴェン",
  piece: "交響曲第9番",
  rating: 5,
  isFavorite: false,
  memo: "",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("PUT /listening-logs/:id (update)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent(undefined, JSON.stringify({ rating: 4 })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  it("body がない場合は 400 を返す", async () => {
    const result = await handler(makeEvent("abc-123", null), mockContext, mockCallback);
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Request body is required");
  });

  it("不正な JSON の場合は 422 を返す", async () => {
    const result = await handler(makeEvent("abc-123", "invalid json"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(422);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Invalid or malformed JSON was provided");
  });

  it.each([0, 6, -1, 1.5, "5", null])(
    "rating が不正な値（%s）の場合は 400 を返す",
    async (invalidRating) => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ rating: invalidRating })),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("rating must be between 1 and 5");
    }
  );

  it("rating を含まない更新は rating のバリデーションをスキップする", async () => {
    vi.mocked(dynamo.send)
      .mockResolvedValueOnce({ Item: existingLog } as never)
      .mockResolvedValueOnce({} as never);

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ isFavorite: true })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(200);
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({ Item: undefined } as never);
    const result = await handler(
      makeEvent("not-found-id", JSON.stringify({ rating: 4 })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(404);
  });

  it("正常更新して 200 を返す", async () => {
    vi.mocked(dynamo.send)
      .mockResolvedValueOnce({ Item: existingLog } as never) // GetCommand
      .mockResolvedValueOnce({} as never); // PutCommand

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4, isFavorite: true })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBe("abc-123");
    expect(body.rating).toBe(4);
    expect(body.isFavorite).toBe(true);
  });

  it("updatedAt が更新されること", async () => {
    vi.mocked(dynamo.send)
      .mockResolvedValueOnce({ Item: existingLog } as never)
      .mockResolvedValueOnce({} as never);

    const before = new Date(existingLog.updatedAt).getTime();
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 })),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(new Date(body.updatedAt).getTime()).toBeGreaterThanOrEqual(before);
  });

  it("id は上書きされない", async () => {
    vi.mocked(dynamo.send)
      .mockResolvedValueOnce({ Item: existingLog } as never)
      .mockResolvedValueOnce({} as never);

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ id: "tampered-id", rating: 4 })),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBe("abc-123");
  });

  it("DynamoDB エラー時に 500 を返す", async () => {
    vi.mocked(dynamo.send).mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(500);
  });
});
