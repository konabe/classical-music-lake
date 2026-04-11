import { describe, it, expect, vi, beforeEach } from "vitest";
import { Conflict } from "http-errors";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import type { ListeningLog } from "../../types";

import { handler } from "./update";
import * as listeningLogRepository from "../../repositories/listening-log-repository";

vi.mock("../../repositories/listening-log-repository", () => ({
  findById: vi.fn(),
  update: vi.fn(),
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
    path: `/listening-logs/${id ?? ""}`,
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

const existingLog: ListeningLog = {
  id: "abc-123",
  userId: TEST_USER_ID,
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
      makeEvent(undefined, JSON.stringify({ rating: 4 }), TEST_USER_ID),
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

  it.each([0, 6, -1, 1.5, "5", null])(
    "rating が不正な値（%s）の場合は 400 を返す",
    async (invalidRating) => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ rating: invalidRating }), TEST_USER_ID),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("rating must be between 1 and 5");
    }
  );

  it.each(["   ", "\t", "\n"])(
    "composer が空白のみ（%j）の場合は 400 を返す",
    async (whitespaceComposer) => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ composer: whitespaceComposer }), TEST_USER_ID),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("composer must be a non-empty string");
    }
  );

  it("composer が 100 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ composer: "あ".repeat(101) }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe(
      "composer must be 100 characters or less"
    );
  });

  it.each(["   ", "\t", "\n"])(
    "piece が空白のみ（%j）の場合は 400 を返す",
    async (whitespacePiece) => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ piece: whitespacePiece }), TEST_USER_ID),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("piece must be a non-empty string");
    }
  );

  it("piece が 200 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ piece: "あ".repeat(201) }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("piece must be 200 characters or less");
  });

  it("memo が 1000 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ memo: "あ".repeat(1001) }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("memo must be 1000 characters or less");
  });

  it("listenedAt が不正なフォーマットの場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ listenedAt: "2024-01-15" }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
  });

  it("他ユーザーのアイテムを更新しようとした場合は 404 を返す", async () => {
    vi.mocked(listeningLogRepository.findById).mockResolvedValueOnce(existingLog);
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 }), OTHER_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(404);
    expect(listeningLogRepository.update).not.toHaveBeenCalled();
  });

  it("userId が null のアイテム（未帰属データ）を更新しようとした場合は 404 を返す", async () => {
    const nullUserLog = { ...existingLog, userId: null };
    vi.mocked(listeningLogRepository.findById).mockResolvedValueOnce(nullUserLog);
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(404);
    expect(listeningLogRepository.update).not.toHaveBeenCalled();
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    vi.mocked(listeningLogRepository.findById).mockResolvedValueOnce(undefined);
    const result = await handler(
      makeEvent("not-found-id", JSON.stringify({ rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(404);
  });

  it("rating を含まない更新は rating のバリデーションをスキップする", async () => {
    vi.mocked(listeningLogRepository.findById).mockResolvedValueOnce(existingLog);
    vi.mocked(listeningLogRepository.update).mockResolvedValueOnce({
      ...existingLog,
      isFavorite: true,
      updatedAt: new Date().toISOString(),
    });

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ isFavorite: true }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(200);
  });

  it("正常更新して 200 を返す", async () => {
    const updatedLog: ListeningLog = {
      ...existingLog,
      rating: 4,
      isFavorite: true,
      updatedAt: new Date().toISOString(),
    };
    vi.mocked(listeningLogRepository.findById).mockResolvedValueOnce(existingLog);
    vi.mocked(listeningLogRepository.update).mockResolvedValueOnce(updatedLog);

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4, isFavorite: true }), TEST_USER_ID),
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
    vi.mocked(listeningLogRepository.findById).mockResolvedValueOnce(existingLog);
    vi.mocked(listeningLogRepository.update).mockResolvedValueOnce({
      ...existingLog,
      updatedAt: now,
    });

    const before = new Date(existingLog.updatedAt).getTime();
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(new Date(body.updatedAt).getTime()).toBeGreaterThanOrEqual(before);
  });

  it("id は上書きされない", async () => {
    vi.mocked(listeningLogRepository.findById).mockResolvedValueOnce(existingLog);
    vi.mocked(listeningLogRepository.update).mockResolvedValueOnce({
      ...existingLog,
      updatedAt: new Date().toISOString(),
    });

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ id: "tampered-id", rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBe("abc-123");
  });

  it("楽観的ロック競合時に 409 を返す", async () => {
    vi.mocked(listeningLogRepository.findById).mockResolvedValueOnce(existingLog);
    vi.mocked(listeningLogRepository.update).mockRejectedValueOnce(
      new Conflict("Item was updated by another request")
    );
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(409);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Item was updated by another request");
  });

  it("Repository エラー時に 500 を返す", async () => {
    vi.mocked(listeningLogRepository.findById).mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(500);
  });
});
