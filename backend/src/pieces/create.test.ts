import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";

import { handler } from "./create";
import { dynamo } from "../utils/dynamodb";

vi.mock("../utils/dynamodb", () => ({
  dynamo: { send: vi.fn() },
  TABLE_PIECES: "test-pieces",
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
    path: "/pieces",
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };
}

const validInput = {
  title: "交響曲第9番",
  composer: "ベートーヴェン",
};

describe("POST /pieces (create)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it("title がない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent(JSON.stringify({ composer: "ベートーヴェン" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("title is required");
  });

  it("composer がない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent(JSON.stringify({ title: "交響曲第9番" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("composer is required");
  });

  it("正常に作成して 201 を返す", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({} as never);
    const result = await handler(makeEvent(JSON.stringify(validInput)), mockContext, mockCallback);
    expect(result?.statusCode).toBe(201);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBeDefined();
    expect(body.title).toBe("交響曲第9番");
    expect(body.composer).toBe("ベートーヴェン");
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
  });

  it("作成アイテムに UUID が付与される", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({} as never);
    const result = await handler(makeEvent(JSON.stringify(validInput)), mockContext, mockCallback);
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBeUUID();
  });

  it("createdAt と updatedAt が同じ値かつ現在時刻で設定される", async () => {
    const now = new Date("2026-03-08T00:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    vi.mocked(dynamo.send).mockResolvedValueOnce({} as never);
    const result = await handler(makeEvent(JSON.stringify(validInput)), mockContext, mockCallback);
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.createdAt).toBe(now.toISOString());
    expect(body.updatedAt).toBe(now.toISOString());
    expect(body.createdAt).toBe(body.updatedAt);
  });

  it("DynamoDB エラー時に 500 を返す", async () => {
    vi.mocked(dynamo.send).mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeEvent(JSON.stringify(validInput)), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
