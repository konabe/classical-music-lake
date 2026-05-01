import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handler } from "./create";
import {
  makeAdminEvent,
  makeAuthEvent,
  makeEvent,
  mockCallback,
  mockContext,
  TEST_COMPOSER_ID,
  TEST_USER_ID,
} from "../../test/fixtures";

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

const validInput = {
  title: "交響曲第9番",
  composerId: TEST_COMPOSER_ID,
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
        makeAdminEvent(TEST_USER_ID, { body, httpMethod: "POST", path: "/pieces" }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(statusCode);
      expect(JSON.parse(result?.body ?? "{}").message).toBe(message);
    });
  });

  it("title がない場合は 400 を返す", async () => {
    const result = await handler(
      makeAdminEvent(TEST_USER_ID, {
        body: JSON.stringify({ composer: "ベートーヴェン" }),
        httpMethod: "POST",
        path: "/pieces",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("title is required");
  });

  it.each(["   ", "\t", "\n"])(
    "title が空白のみ（%j）の場合は 400 を返す",
    async (whitespaceTitle) => {
      const result = await handler(
        makeAdminEvent(TEST_USER_ID, {
          body: JSON.stringify({ ...validInput, title: whitespaceTitle }),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("title is required");
    },
  );

  it("title が 200 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeAdminEvent(TEST_USER_ID, {
        body: JSON.stringify({ ...validInput, title: "あ".repeat(201) }),
        httpMethod: "POST",
        path: "/pieces",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("title must be 200 characters or less");
  });

  it("composerId がない場合は 400 を返す", async () => {
    const result = await handler(
      makeAdminEvent(TEST_USER_ID, {
        body: JSON.stringify({ title: "交響曲第9番" }),
        httpMethod: "POST",
        path: "/pieces",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("composerId must be a valid UUID");
  });

  it.each(["", "not-a-uuid", "   "])(
    "composerId が UUID 形式でない（%j）場合は 400 を返す",
    async (invalidComposerId) => {
      const result = await handler(
        makeAdminEvent(TEST_USER_ID, {
          body: JSON.stringify({ ...validInput, composerId: invalidComposerId }),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("composerId must be a valid UUID");
    },
  );

  it("videoUrl が不正な URL の場合は 400 を返す", async () => {
    const result = await handler(
      makeAdminEvent(TEST_USER_ID, {
        body: JSON.stringify({ ...validInput, videoUrl: "not-a-url" }),
        httpMethod: "POST",
        path: "/pieces",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("videoUrl must be a valid URL");
  });

  it("videoUrl なしで正常に作成して 201 を返す", async () => {
    mockRepo.save.mockResolvedValueOnce();
    const result = await handler(
      makeAdminEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/pieces",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(201);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBeDefined();
    expect(body.title).toBe("交響曲第9番");
    expect(body.composerId).toBe(TEST_COMPOSER_ID);
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
    expect(body.videoUrl).toBeUndefined();
  });

  it("有効な videoUrl を指定して作成できる", async () => {
    mockRepo.save.mockResolvedValueOnce();
    const result = await handler(
      makeAdminEvent(TEST_USER_ID, {
        body: JSON.stringify({ ...validInput, videoUrl: "https://www.youtube.com/watch?v=abc123" }),
        httpMethod: "POST",
        path: "/pieces",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(201);
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.videoUrl).toBe("https://www.youtube.com/watch?v=abc123");
  });

  it("作成アイテムに UUID が付与される", async () => {
    mockRepo.save.mockResolvedValueOnce();
    const result = await handler(
      makeAdminEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/pieces",
      }),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBeUUID();
  });

  it("createdAt と updatedAt が同じ値かつ現在時刻で設定される", async () => {
    const now = new Date("2026-03-08T00:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    mockRepo.save.mockResolvedValueOnce();
    const result = await handler(
      makeAdminEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/pieces",
      }),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.createdAt).toBe(now.toISOString());
    expect(body.updatedAt).toBe(now.toISOString());
    expect(body.createdAt).toBe(body.updatedAt);
  });

  describe("カテゴリフィールド", () => {
    it("全カテゴリを指定して作成できる", async () => {
      mockRepo.save.mockResolvedValueOnce();
      const result = await handler(
        makeAdminEvent(TEST_USER_ID, {
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
        mockCallback,
      );
      expect(result?.statusCode).toBe(201);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.genre).toBe("交響曲");
      expect(body.era).toBe("古典派");
      expect(body.formation).toBe("管弦楽");
      expect(body.region).toBe("ドイツ・オーストリア");
    });

    it("カテゴリなしで作成できる（後方互換性）", async () => {
      mockRepo.save.mockResolvedValueOnce();
      const result = await handler(
        makeAdminEvent(TEST_USER_ID, {
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(201);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.genre).toBeUndefined();
      expect(body.era).toBeUndefined();
      expect(body.formation).toBeUndefined();
      expect(body.region).toBeUndefined();
    });

    it("一部のカテゴリのみ指定して作成できる", async () => {
      mockRepo.save.mockResolvedValueOnce();
      const result = await handler(
        makeAdminEvent(TEST_USER_ID, {
          body: JSON.stringify({ ...validInput, genre: "協奏曲", era: "ロマン派" }),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback,
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
        makeAdminEvent(TEST_USER_ID, {
          body: JSON.stringify({ ...validInput, genre: "不正な値" }),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });

    it("era に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeAdminEvent(TEST_USER_ID, {
          body: JSON.stringify({ ...validInput, era: "不正な値" }),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });

    it("formation に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeAdminEvent(TEST_USER_ID, {
          body: JSON.stringify({ ...validInput, formation: "不正な値" }),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });

    it("region に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeAdminEvent(TEST_USER_ID, {
          body: JSON.stringify({ ...validInput, region: "不正な値" }),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockRepo.save.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeAdminEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/pieces",
      }),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(500);
  });

  describe("認可", () => {
    it("admin グループに属さないユーザーは 403 を返し、データを保存しない", async () => {
      const result = await handler(
        makeAuthEvent(TEST_USER_ID, {
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/pieces",
        }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(403);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("Admin privilege required");
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it("認証クレームがない場合は 403 を返し、データを保存しない", async () => {
      const result = await handler(
        makeEvent({ body: JSON.stringify(validInput), httpMethod: "POST", path: "/pieces" }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(403);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("Admin privilege required");
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it("cognito:groups がカンマ区切り文字列で admin を含まない場合は 403", async () => {
      const result = await handler(
        makeAuthEvent(
          TEST_USER_ID,
          { body: JSON.stringify(validInput), httpMethod: "POST", path: "/pieces" },
          "viewer,editor",
        ),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(403);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it("cognito:groups がカンマ区切り文字列で admin を含む場合は 201", async () => {
      mockRepo.save.mockResolvedValueOnce();
      const result = await handler(
        makeAuthEvent(
          TEST_USER_ID,
          { body: JSON.stringify(validInput), httpMethod: "POST", path: "/pieces" },
          "admin,editor",
        ),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(201);
    });
  });
});
