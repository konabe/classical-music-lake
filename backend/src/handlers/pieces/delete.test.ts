import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";

import { handler } from "./delete";

const mockRepo = vi.hoisted(() => ({
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  saveWithOptimisticLock: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("../../repositories/piece-repository", () => ({
  DynamoDBPieceRepository: vi.fn().mockImplementation(function () {
    return mockRepo;
  }),
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

function makeEvent(id: string | null): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "DELETE",
    isBase64Encoded: false,
    path: `/pieces/${id ?? ""}`,
    pathParameters: id === null ? null : { id },
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };
}

describe("DELETE /pieces/{id} (delete)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(makeEvent(null), mockContext, mockCallback);
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  it("正常に削除して 204 を返す", async () => {
    mockRepo.remove.mockResolvedValueOnce();
    const result = await handler(makeEvent("test-id-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(204);
    expect(result?.body).toBe("");
  });

  it("正しい id で Repository.remove を呼び出す", async () => {
    mockRepo.remove.mockResolvedValueOnce();
    await handler(makeEvent("test-id-123"), mockContext, mockCallback);

    expect(mockRepo.remove).toHaveBeenCalledWith("test-id-123");
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockRepo.remove.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeEvent("test-id-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
