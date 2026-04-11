import type { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";

import { handler } from "./delete";
import { dynamo } from "../utils/dynamodb";

vi.mock("../utils/dynamodb", () => ({
  dynamo: { send: vi.fn() },
  TABLE_PIECES: "test-pieces",
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
    vi.mocked(dynamo.send).mockResolvedValueOnce({} as never);
    const result = await handler(makeEvent("test-id-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(204);
    expect(result?.body).toBe("");
  });

  it("正しい TableName と Key で DeleteCommand を送信する", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({} as never);
    await handler(makeEvent("test-id-123"), mockContext, mockCallback);

    const sentCommand = vi.mocked(dynamo.send).mock.calls[0][0] as DeleteCommand;
    expect(sentCommand.input).toEqual({
      TableName: "test-pieces",
      Key: { id: "test-id-123" },
    });
  });

  it("DynamoDB エラー時に 500 を返す", async () => {
    vi.mocked(dynamo.send).mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeEvent("test-id-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
