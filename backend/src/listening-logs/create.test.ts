import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";

import { handler } from "./create";
import { dynamo } from "../utils/dynamodb";

vi.mock("../utils/dynamodb", () => ({
  dynamo: { send: vi.fn() },
  TABLE_LISTENING_LOGS: "test-listening-logs",
}));

const mockContext = {} as Context;
const mockCallback = vi.fn();

function makeEvent(body: string | null): APIGatewayProxyEvent {
  return {
    body,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "POST",
    isBase64Encoded: false,
    path: "/listening-logs",
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };
}

const validInput = {
  listenedAt: "2024-01-15T20:00:00.000Z",
  composer: "ベートーヴェン",
  piece: "交響曲第9番",
  performer: "ベルリン・フィル",
  conductor: "カラヤン",
  rating: 5,
  isFavorite: true,
  memo: "素晴らしい演奏",
};

describe("POST /listening-logs (create)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("body がない場合は 400 を返す", async () => {
    const result = await handler(makeEvent(null), mockContext, mockCallback);
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Request body is required");
  });

  it("不正な JSON の場合は 400 を返す", async () => {
    const result = await handler(makeEvent("invalid json"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Invalid JSON");
  });

  it("JSON が null の場合は 400 を返す", async () => {
    const result = await handler(makeEvent("null"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Request body must be a JSON object");
  });

  it("JSON が配列の場合は 400 を返す", async () => {
    const result = await handler(makeEvent("[]"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Request body must be a JSON object");
  });

  it.each([0, 6, -1, 1.5, "5", null])(
    "rating が不正な値（%s）の場合は 400 を返す",
    async (invalidRating) => {
      const result = await handler(
        makeEvent(JSON.stringify({ ...validInput, rating: invalidRating })),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("rating must be between 1 and 5");
    }
  );

  it("正常に作成して 201 を返す", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({} as never);
    const result = await handler(makeEvent(JSON.stringify(validInput)), mockContext, mockCallback);
    expect(result?.statusCode).toBe(201);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBeDefined();
    expect(body.composer).toBe("ベートーヴェン");
    expect(body.piece).toBe("交響曲第9番");
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
  });

  it("作成アイテムに UUID が付与される", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({} as never);
    const result = await handler(makeEvent(JSON.stringify(validInput)), mockContext, mockCallback);
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("createdAt と updatedAt が同じ値で設定される", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({} as never);
    const result = await handler(makeEvent(JSON.stringify(validInput)), mockContext, mockCallback);
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.createdAt).toBe(body.updatedAt);
  });

  it("DynamoDB エラー時に 500 を返す", async () => {
    vi.mocked(dynamo.send).mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeEvent(JSON.stringify(validInput)), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
