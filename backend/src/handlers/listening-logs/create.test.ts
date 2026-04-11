import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Context } from "aws-lambda";

import { handler } from "./create";
import { makeEvent, makeAuthEvent } from "../../test/fixtures";

const mockRepo = vi.hoisted(() => ({
  save: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("../../repositories/listening-log-repository", () => ({
  DynamoDBListeningLogRepository: vi.fn().mockImplementation(function () {
    return mockRepo;
  }),
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

const validInput = {
  listenedAt: "2024-01-15T20:00:00.000Z",
  composer: "ベートーヴェン",
  piece: "交響曲第9番",
  rating: 5,
  isFavorite: true,
  memo: "素晴らしい演奏",
};

const TEST_USER_ID = "cognito-sub-user-123";

describe("POST /listening-logs (create)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("リクエストボディ異常系", () => {
    it.each<[string | null, number, string]>([
      [null, 400, "Request body is required"],
      ["null", 400, "Request body is required"],
      ["[]", 400, "Request body must be a JSON object"],
      ["invalid json", 422, "Invalid or malformed JSON was provided"],
    ])("body=%j のとき %i を返す", async (body, statusCode, message) => {
      const result = await handler(
        makeEvent({ body, httpMethod: "POST", path: "/listening-logs" }),
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
        makeEvent({
          body: JSON.stringify({ ...validInput, rating: invalidRating }),
          httpMethod: "POST",
          path: "/listening-logs",
        }),
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
        makeEvent({
          body: JSON.stringify({ ...validInput, composer: whitespaceComposer }),
          httpMethod: "POST",
          path: "/listening-logs",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("composer must be a non-empty string");
    }
  );

  it("composer が 100 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({ ...validInput, composer: "あ".repeat(101) }),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
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
        makeEvent({
          body: JSON.stringify({ ...validInput, piece: whitespacePiece }),
          httpMethod: "POST",
          path: "/listening-logs",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("piece must be a non-empty string");
    }
  );

  it("piece が 200 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({ ...validInput, piece: "あ".repeat(201) }),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("piece must be 200 characters or less");
  });

  it("memo が 1000 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({ ...validInput, memo: "あ".repeat(1001) }),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("memo must be 1000 characters or less");
  });

  it("正常に作成して 201 を返す", async () => {
    mockRepo.save.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(201);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBeDefined();
    expect(body.composer).toBe("ベートーヴェン");
    expect(body.piece).toBe("交響曲第9番");
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
  });

  it("作成アイテムに UUID が付与される", async () => {
    mockRepo.save.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("createdAt と updatedAt が同じ値で設定される", async () => {
    mockRepo.save.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.createdAt).toBe(body.updatedAt);
  });

  it("userId が保存される", async () => {
    mockRepo.save.mockResolvedValueOnce(undefined);
    await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback
    );

    const savedItem = mockRepo.save.mock.calls[0][0];
    expect(savedItem.userId).toBe(TEST_USER_ID);
  });

  it("レスポンスボディに userId が含まれる", async () => {
    mockRepo.save.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.userId).toBe(TEST_USER_ID);
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockRepo.save.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/listening-logs",
      }),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(500);
  });
});
