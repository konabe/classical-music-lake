import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import type { Piece } from "../types";

import { handler } from "./update";
import { dynamo } from "../utils/dynamodb";

vi.mock("../utils/dynamodb", () => ({
  dynamo: { send: vi.fn() },
  TABLE_PIECES: "test-pieces",
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
    path: `/pieces/${id ?? ""}`,
    pathParameters: id ? { id } : null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };
}

const existingPiece: Piece = {
  id: "abc-123",
  title: "交響曲第9番",
  composer: "ベートーヴェン",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("PUT /pieces/{id} (update)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent(undefined, JSON.stringify({ title: "新タイトル" })),
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

  it("title が空文字の場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ title: "" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("title must be a non-empty string");
  });

  it("composer が空文字の場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ composer: "" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("composer must be a non-empty string");
  });

  it("title を含まない更新は title のバリデーションをスキップする", async () => {
    vi.mocked(dynamo.send)
      .mockResolvedValueOnce({ Item: existingPiece } as never)
      .mockResolvedValueOnce({} as never);

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ composer: "モーツァルト" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(200);
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({ Item: undefined } as never);
    const result = await handler(
      makeEvent("not-found-id", JSON.stringify({ title: "新タイトル" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(404);
  });

  it("正常更新して 200 を返す", async () => {
    vi.mocked(dynamo.send)
      .mockResolvedValueOnce({ Item: existingPiece } as never)
      .mockResolvedValueOnce({} as never);

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ title: "交響曲第5番", composer: "ベートーヴェン" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.id).toBe("abc-123");
    expect(body.title).toBe("交響曲第5番");
    expect(body.composer).toBe("ベートーヴェン");
  });

  it("updatedAt が更新されること", async () => {
    vi.mocked(dynamo.send)
      .mockResolvedValueOnce({ Item: existingPiece } as never)
      .mockResolvedValueOnce({} as never);

    const before = new Date(existingPiece.updatedAt).getTime();
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ title: "交響曲第5番" })),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(new Date(body.updatedAt).getTime()).toBeGreaterThanOrEqual(before);
  });

  it("createdAt は上書きされない", async () => {
    vi.mocked(dynamo.send)
      .mockResolvedValueOnce({ Item: existingPiece } as never)
      .mockResolvedValueOnce({} as never);

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ title: "交響曲第5番" })),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.createdAt).toBe(existingPiece.createdAt);
  });

  it("id は上書きされない", async () => {
    vi.mocked(dynamo.send)
      .mockResolvedValueOnce({ Item: existingPiece } as never)
      .mockResolvedValueOnce({} as never);

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ title: "交響曲第5番" })),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.id).toBe("abc-123");
  });

  it("楽観的ロック競合時に 409 を返す", async () => {
    vi.mocked(dynamo.send)
      .mockResolvedValueOnce({ Item: existingPiece } as never)
      .mockRejectedValueOnce(
        new ConditionalCheckFailedException({ message: "conflict", $metadata: {} })
      );

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ title: "交響曲第5番" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(409);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Piece was updated by another request");
  });

  it("DynamoDB エラー時に 500 を返す", async () => {
    vi.mocked(dynamo.send).mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ title: "交響曲第5番" })),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(500);
  });
});
