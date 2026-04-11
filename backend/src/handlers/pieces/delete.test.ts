import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";

import { handler } from "./delete";
import * as pieceRepository from "../../repositories/piece-repository";

vi.mock("../../repositories/piece-repository", () => ({
  remove: vi.fn(),
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
    vi.mocked(pieceRepository.remove).mockResolvedValueOnce();
    const result = await handler(makeEvent("test-id-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(204);
    expect(result?.body).toBe("");
  });

  it("正しい id で Repository.remove を呼び出す", async () => {
    vi.mocked(pieceRepository.remove).mockResolvedValueOnce();
    await handler(makeEvent("test-id-123"), mockContext, mockCallback);

    expect(pieceRepository.remove).toHaveBeenCalledWith("test-id-123");
  });

  it("Repository エラー時に 500 を返す", async () => {
    vi.mocked(pieceRepository.remove).mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeEvent("test-id-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
