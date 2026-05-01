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

vi.mock("../../repositories/concert-log-repository", () => ({
  DynamoDBConcertLogRepository: vi.fn().mockImplementation(function () {
    return mockRepo;
  }),
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

const validInput = {
  title: "定期演奏会 第123回",
  concertDate: "2024-01-15T19:00:00.000Z",
  venue: "サントリーホール",
};

const TEST_USER_ID = "cognito-sub-user-123";

describe("POST /concert-logs (create)", () => {
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
        makeEvent({ body, httpMethod: "POST", path: "/concert-logs" }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(statusCode);
      expect(JSON.parse(result?.body ?? "{}").message).toBe(message);
    });
  });

  it.each(["   ", "\t", "\n"])(
    "venue が空白のみ（%j）の場合は 400 を返す",
    async (whitespaceVenue) => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, venue: whitespaceVenue }),
          httpMethod: "POST",
          path: "/concert-logs",
        }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("venue must be a non-empty string");
    },
  );

  it("venue が 200 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({ ...validInput, venue: "あ".repeat(201) }),
        httpMethod: "POST",
        path: "/concert-logs",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("venue must be 200 characters or less");
  });

  it("conductor が 100 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({ ...validInput, conductor: "あ".repeat(101) }),
        httpMethod: "POST",
        path: "/concert-logs",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe(
      "conductor must be 100 characters or less",
    );
  });

  it("orchestra が 100 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({ ...validInput, orchestra: "あ".repeat(101) }),
        httpMethod: "POST",
        path: "/concert-logs",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe(
      "orchestra must be 100 characters or less",
    );
  });

  it("soloist が 100 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({ ...validInput, soloist: "あ".repeat(101) }),
        httpMethod: "POST",
        path: "/concert-logs",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("soloist must be 100 characters or less");
  });

  it("正常に作成して 201 を返す", async () => {
    mockRepo.save.mockResolvedValueOnce();
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/concert-logs",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(201);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBeDefined();
    expect(body.venue).toBe("サントリーホール");
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
  });

  it("任意フィールドを含めて正常に作成して 201 を返す", async () => {
    mockRepo.save.mockResolvedValueOnce();
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify({
          ...validInput,
          conductor: "カラヤン",
          orchestra: "ベルリン・フィル",
          soloist: "アルゲリッチ",
        }),
        httpMethod: "POST",
        path: "/concert-logs",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(201);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.conductor).toBe("カラヤン");
    expect(body.orchestra).toBe("ベルリン・フィル");
    expect(body.soloist).toBe("アルゲリッチ");
  });

  it("作成アイテムに UUID が付与される", async () => {
    mockRepo.save.mockResolvedValueOnce();
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/concert-logs",
      }),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBeUUID();
  });

  it("createdAt と updatedAt が同じ値で設定される", async () => {
    mockRepo.save.mockResolvedValueOnce();
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/concert-logs",
      }),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.createdAt).toBe(body.updatedAt);
  });

  it("userId が保存される", async () => {
    mockRepo.save.mockResolvedValueOnce();
    await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/concert-logs",
      }),
      mockContext,
      mockCallback,
    );

    const savedItem = mockRepo.save.mock.calls[0][0];
    expect(savedItem.userId).toBe(TEST_USER_ID);
  });

  it("レスポンスボディに userId が含まれる", async () => {
    mockRepo.save.mockResolvedValueOnce();
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/concert-logs",
      }),
      mockContext,
      mockCallback,
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
        path: "/concert-logs",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(500);
  });

  it("pieceIds を含めて正常に作成して 201 を返す", async () => {
    mockRepo.save.mockResolvedValueOnce();
    const pieceIds = [
      "550e8400-e29b-41d4-a716-446655440000",
      "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    ];
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify({ ...validInput, pieceIds }),
        httpMethod: "POST",
        path: "/concert-logs",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(201);
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.pieceIds).toEqual(pieceIds);
  });

  it("pieceIds が空配列でも正常に作成できる", async () => {
    mockRepo.save.mockResolvedValueOnce();
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify({ ...validInput, pieceIds: [] }),
        httpMethod: "POST",
        path: "/concert-logs",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(201);
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.pieceIds).toEqual([]);
  });

  it("pieceIds に UUID 形式でない文字列が含まれる場合は 400 を返す", async () => {
    const result = await handler(
      makeAuthEvent(TEST_USER_ID, {
        body: JSON.stringify({ ...validInput, pieceIds: ["not-a-uuid"] }),
        httpMethod: "POST",
        path: "/concert-logs",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
  });
});
