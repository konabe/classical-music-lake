import { describe, it, expect, vi, beforeEach } from "vitest";
import { Conflict } from "http-errors";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import type { ConcertLog } from "../types";

import { handler } from "./update";
import * as dynamodb from "../utils/dynamodb";

vi.mock("../utils/dynamodb", () => ({
  updateItem: vi.fn(),
  dynamo: { send: vi.fn() },
  TABLE_CONCERT_LOGS: "test-concert-logs",
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

const TEST_USER_ID = "cognito-sub-user-123";
const OTHER_USER_ID = "cognito-sub-other-user";

function makeEvent(id?: string, body?: string | null, userId?: string): APIGatewayProxyEvent {
  return {
    body: body === undefined ? null : body,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "PUT",
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

const existingLog: ConcertLog = {
  id: "abc-123",
  userId: TEST_USER_ID,
  title: "定期演奏会 第100回",
  concertDate: "2024-01-15T19:00:00.000Z",
  venue: "サントリーホール",
  conductor: "小澤征爾",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("PUT /concert-logs/:id (update)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent(undefined, JSON.stringify({ venue: "東京文化会館" }), TEST_USER_ID),
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
      const result = await handler(
        makeEvent("abc-123", body, TEST_USER_ID),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(statusCode);
      expect(JSON.parse(result?.body ?? "{}").message).toBe(message);
    });
  });

  it.each(["   ", "\t", "\n"])(
    "venue が空白のみ（%j）の場合は 400 を返す",
    async (whitespaceVenue) => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ venue: whitespaceVenue }), TEST_USER_ID),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("venue must be a non-empty string");
    }
  );

  it("venue が 200 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ venue: "あ".repeat(201) }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("venue must be 200 characters or less");
  });

  it("conductor が 100 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ conductor: "あ".repeat(101) }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe(
      "conductor must be 100 characters or less"
    );
  });

  it("concertDate が不正なフォーマットの場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ concertDate: "2024-01-15" }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
  });

  it("他ユーザーのアイテムを更新しようとした場合は 404 を返す", async () => {
    vi.mocked(dynamodb.dynamo.send).mockResolvedValueOnce({ Item: existingLog } as never);
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ venue: "東京文化会館" }), OTHER_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(404);
    expect(dynamodb.updateItem).not.toHaveBeenCalled();
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    vi.mocked(dynamodb.dynamo.send).mockResolvedValueOnce({ Item: undefined } as never);
    const result = await handler(
      makeEvent("not-found-id", JSON.stringify({ venue: "東京文化会館" }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(404);
  });

  it("正常更新して 200 を返す", async () => {
    const updatedLog: ConcertLog = {
      ...existingLog,
      venue: "東京文化会館",
      updatedAt: new Date().toISOString(),
    };
    vi.mocked(dynamodb.dynamo.send).mockResolvedValueOnce({ Item: existingLog } as never);
    vi.mocked(dynamodb.updateItem).mockResolvedValueOnce(updatedLog);

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ venue: "東京文化会館" }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBe("abc-123");
    expect(body.venue).toBe("東京文化会館");
  });

  it("venue のみ更新して concertDate はそのままであること", async () => {
    vi.mocked(dynamodb.dynamo.send).mockResolvedValueOnce({ Item: existingLog } as never);
    vi.mocked(dynamodb.updateItem).mockResolvedValueOnce({
      ...existingLog,
      venue: "東京文化会館",
      updatedAt: new Date().toISOString(),
    });

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ venue: "東京文化会館" }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(200);
  });

  it("楽観的ロック競合時に 409 を返す", async () => {
    vi.mocked(dynamodb.dynamo.send).mockResolvedValueOnce({ Item: existingLog } as never);
    vi.mocked(dynamodb.updateItem).mockRejectedValueOnce(
      new Conflict("Item was updated by another request")
    );
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ venue: "東京文化会館" }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(409);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Item was updated by another request");
  });

  it("DynamoDB エラー時に 500 を返す", async () => {
    vi.mocked(dynamodb.dynamo.send).mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ venue: "東京文化会館" }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(500);
  });

  it("pieceIds を更新できる", async () => {
    const pieceId = "550e8400-e29b-41d4-a716-446655440000";
    const updatedLog: ConcertLog = {
      ...existingLog,
      pieceIds: [pieceId],
      updatedAt: new Date().toISOString(),
    };
    vi.mocked(dynamodb.dynamo.send).mockResolvedValueOnce({ Item: existingLog } as never);
    vi.mocked(dynamodb.updateItem).mockResolvedValueOnce(updatedLog);

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ pieceIds: [pieceId] }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.pieceIds).toEqual([pieceId]);
  });

  it("pieceIds を空配列で更新するとプログラムが全削除される", async () => {
    const existingLogWithPieces: ConcertLog = {
      ...existingLog,
      pieceIds: ["550e8400-e29b-41d4-a716-446655440000"],
    };
    const updatedLog: ConcertLog = {
      ...existingLog,
      pieceIds: [],
      updatedAt: new Date().toISOString(),
    };
    vi.mocked(dynamodb.dynamo.send).mockResolvedValueOnce({
      Item: existingLogWithPieces,
    } as never);
    vi.mocked(dynamodb.updateItem).mockResolvedValueOnce(updatedLog);

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ pieceIds: [] }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.pieceIds).toEqual([]);
  });
});
