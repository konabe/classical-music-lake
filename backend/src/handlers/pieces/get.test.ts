import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import type { Piece } from "../../types";

import { handler } from "./get";

const mockRepo = vi.hoisted(() => {
  return {
    save: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    saveWithOptimisticLock: vi.fn(),
    remove: vi.fn(),
  };
});

vi.mock("../../repositories/piece-repository", () => {
  return {
    DynamoDBPieceRepository: vi.fn().mockImplementation(function () {
      return mockRepo;
    }),
  };
});

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

function makeEvent(id?: string): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "GET",
    isBase64Encoded: false,
    path: `/pieces/${id ?? ""}`,
    pathParameters: id === undefined ? null : { id },
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };
}

const testPiece: Piece = {
  id: "abc-123",
  title: "交響曲第9番",
  composer: "ベートーヴェン",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("GET /pieces/{id} (get)", () => {
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
    const result = await handler(makeEvent("not-found-id"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(404);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Piece not found");
  });

  it("正常に取得して 200 を返す", async () => {
    mockRepo.findById.mockResolvedValueOnce(testPiece);
    const result = await handler(makeEvent("abc-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.id).toBe("abc-123");
    expect(body.title).toBe("交響曲第9番");
    expect(body.composer).toBe("ベートーヴェン");
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockRepo.findById.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeEvent("abc-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
