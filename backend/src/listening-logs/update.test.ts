import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import type { ListeningLog } from "../types";

import { handler } from "./update";
import * as dynamodb from "../utils/dynamodb";

vi.mock("../utils/dynamodb", () => ({
  updateItem: vi.fn(),
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

  describe("リクエストボディ異常系", () => {
    it.each<[string | null, number, string]>([
      [null, 400, "Request body is required"],
      ["null", 400, "Request body is required"],
      ["[]", 400, "Request body must be a JSON object"],
      ["invalid json", 422, "Invalid or malformed JSON was provided"],
    ])("body=%j のとき %i を返す", async (body, statusCode, message) => {
      const result = await handler(makeEvent("abc-123", body), mockContext, mockCallback);
      expect(result?.statusCode).toBe(statusCode);
      expect(JSON.parse(result?.body ?? "{}").message).toBe(message);
    });
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
    vi.mocked(dynamodb.updateItem).mockResolvedValueOnce({
      ...existingLog,
      isFavorite: true,
      updatedAt: new Date().toISOString(),
    });

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ isFavorite: true })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(200);
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    const { NotFound } = await import("http-errors");
    vi.mocked(dynamodb.updateItem).mockRejectedValueOnce(new NotFound("Item not found"));
    const result = await handler(
      makeEvent("not-found-id", JSON.stringify({ rating: 4 })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(404);
  });

  it("正常更新して 200 を返す", async () => {
    const updatedLog: ListeningLog = {
      ...existingLog,
      rating: 4,
      isFavorite: true,
      updatedAt: new Date().toISOString(),
    };
    vi.mocked(dynamodb.updateItem).mockResolvedValueOnce(updatedLog);

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
    const now = new Date().toISOString();
    vi.mocked(dynamodb.updateItem).mockResolvedValueOnce({
      ...existingLog,
      updatedAt: now,
    });

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
    vi.mocked(dynamodb.updateItem).mockResolvedValueOnce({
      ...existingLog,
      updatedAt: new Date().toISOString(),
    });

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ id: "tampered-id", rating: 4 })),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBe("abc-123");
  });

  it("DynamoDB エラー時に 500 を返す", async () => {
    vi.mocked(dynamodb.updateItem).mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(500);
  });
});
