import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Context } from "aws-lambda";

import { handler } from "./create";
import { dynamo } from "../utils/dynamodb";
import { makeEvent } from "../test/fixtures";

vi.mock("../utils/dynamodb", () => ({
  dynamo: { send: vi.fn() },
  TABLE_PIECES: "test-pieces",
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

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

  describe("リクエストボディ異常系", () => {
    it.each<[string | null, number, string]>([
      [null, 400, "Request body is required"],
      ["null", 400, "Request body is required"],
      ["[]", 400, "Request body must be a JSON object"],
      ["invalid json", 422, "Invalid or malformed JSON was provided"],
    ])("body=%j のとき %i を返す", async (body, statusCode, message) => {
      const result = await handler(
        makeEvent({ body, httpMethod: "POST", path: "/pieces" }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(statusCode);
      expect(JSON.parse(result?.body ?? "{}").message).toBe(message);
    });
  });

  it("title がない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({ composer: "ベートーヴェン" }),
        httpMethod: "POST",
        path: "/pieces",
      }),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("title is required");
  });

  it.each(["   ", "\t", "\n"])(
    "title が空白のみ（%j）の場合は 400 を返す",
    async (whitespaceTitle) => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, title: whitespaceTitle }),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("title is required");
    }
  );

  it("title が 200 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({ ...validInput, title: "あ".repeat(201) }),
        httpMethod: "POST",
        path: "/pieces",
      }),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("title must be 200 characters or less");
  });

  it("composer がない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({ title: "交響曲第9番" }),
        httpMethod: "POST",
        path: "/pieces",
      }),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("composer is required");
  });

  it.each(["   ", "\t", "\n"])(
    "composer が空白のみ（%j）の場合は 400 を返す",
    async (whitespaceComposer) => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, composer: whitespaceComposer }),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("composer is required");
    }
  );

  it("composer が 100 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({ ...validInput, composer: "あ".repeat(101) }),
        httpMethod: "POST",
        path: "/pieces",
      }),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe(
      "composer must be 100 characters or less"
    );
  });

  it("videoUrl が不正な URL の場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent({
        body: JSON.stringify({ ...validInput, videoUrl: "not-a-url" }),
        httpMethod: "POST",
        path: "/pieces",
      }),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("videoUrl must be a valid URL");
  });

  it("videoUrl なしで正常に作成して 201 を返す", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({} as never);
    const result = await handler(
      makeEvent({ body: JSON.stringify(validInput), httpMethod: "POST", path: "/pieces" }),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(201);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBeDefined();
    expect(body.title).toBe("交響曲第9番");
    expect(body.composer).toBe("ベートーヴェン");
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
    expect(body.videoUrl).toBeUndefined();
  });

  it("有効な videoUrl を指定して作成できる", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({} as never);
    const result = await handler(
      makeEvent({
        body: JSON.stringify({ ...validInput, videoUrl: "https://www.youtube.com/watch?v=abc123" }),
        httpMethod: "POST",
        path: "/pieces",
      }),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(201);
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.videoUrl).toBe("https://www.youtube.com/watch?v=abc123");
  });

  it("作成アイテムに UUID が付与される", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({} as never);
    const result = await handler(
      makeEvent({ body: JSON.stringify(validInput), httpMethod: "POST", path: "/pieces" }),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBeUUID();
  });

  it("createdAt と updatedAt が同じ値かつ現在時刻で設定される", async () => {
    const now = new Date("2026-03-08T00:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    vi.mocked(dynamo.send).mockResolvedValueOnce({} as never);
    const result = await handler(
      makeEvent({ body: JSON.stringify(validInput), httpMethod: "POST", path: "/pieces" }),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.createdAt).toBe(now.toISOString());
    expect(body.updatedAt).toBe(now.toISOString());
    expect(body.createdAt).toBe(body.updatedAt);
  });

  describe("カテゴリフィールド", () => {
    it("全カテゴリを指定して作成できる", async () => {
      vi.mocked(dynamo.send).mockResolvedValueOnce({} as never);
      const result = await handler(
        makeEvent({
          body: JSON.stringify({
            ...validInput,
            genre: "交響曲",
            era: "古典派",
            formation: "管弦楽",
            region: "ドイツ・オーストリア",
          }),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(201);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.genre).toBe("交響曲");
      expect(body.era).toBe("古典派");
      expect(body.formation).toBe("管弦楽");
      expect(body.region).toBe("ドイツ・オーストリア");
    });

    it("カテゴリなしで作成できる（後方互換性）", async () => {
      vi.mocked(dynamo.send).mockResolvedValueOnce({} as never);
      const result = await handler(
        makeEvent({ body: JSON.stringify(validInput), httpMethod: "POST", path: "/pieces" }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(201);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.genre).toBeUndefined();
      expect(body.era).toBeUndefined();
      expect(body.formation).toBeUndefined();
      expect(body.region).toBeUndefined();
    });

    it("一部のカテゴリのみ指定して作成できる", async () => {
      vi.mocked(dynamo.send).mockResolvedValueOnce({} as never);
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, genre: "協奏曲", era: "ロマン派" }),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(201);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.genre).toBe("協奏曲");
      expect(body.era).toBe("ロマン派");
      expect(body.formation).toBeUndefined();
      expect(body.region).toBeUndefined();
    });

    it("genre に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, genre: "不正な値" }),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });

    it("era に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, era: "不正な値" }),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });

    it("formation に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, formation: "不正な値" }),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });

    it("region に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, region: "不正な値" }),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });
  });

  it("DynamoDB エラー時に 500 を返す", async () => {
    vi.mocked(dynamo.send).mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeEvent({ body: JSON.stringify(validInput), httpMethod: "POST", path: "/pieces" }),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(500);
  });
});
