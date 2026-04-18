import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handler } from "./create";
import {
  makeAdminEvent,
  makeAuthEvent,
  makeEvent,
  mockCallback,
  mockContext,
  TEST_USER_ID,
} from "../../test/fixtures";

const mockRepo = vi.hoisted(() => ({
  save: vi.fn(),
  findById: vi.fn(),
  findPage: vi.fn(),
  saveWithOptimisticLock: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("../../repositories/composer-repository", () => ({
  DynamoDBComposerRepository: vi.fn().mockImplementation(function () {
    return mockRepo;
  }),
}));

const validInput = {
  name: "ベートーヴェン",
};

describe("POST /composers (create)", () => {
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
        makeAdminEvent(TEST_USER_ID, { body, httpMethod: "POST", path: "/composers" }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(statusCode);
      expect(JSON.parse(result?.body ?? "{}").message).toBe(message);
    });
  });

  it("name がない場合は 400 を返す", async () => {
    const result = await handler(
      makeAdminEvent(TEST_USER_ID, {
        body: JSON.stringify({}),
        httpMethod: "POST",
        path: "/composers",
      }),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("name is required");
  });

  it.each(["   ", "\t", "\n"])(
    "name が空白のみ（%j）の場合は 400 を返す",
    async (whitespaceName) => {
      const result = await handler(
        makeAdminEvent(TEST_USER_ID, {
          body: JSON.stringify({ name: whitespaceName }),
          httpMethod: "POST",
          path: "/composers",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("name is required");
    }
  );

  it("name が 100 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeAdminEvent(TEST_USER_ID, {
        body: JSON.stringify({ name: "あ".repeat(101) }),
        httpMethod: "POST",
        path: "/composers",
      }),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("name must be 100 characters or less");
  });

  it("必須項目のみで正常に作成して 201 を返す", async () => {
    mockRepo.save.mockResolvedValueOnce();
    const result = await handler(
      makeAdminEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/composers",
      }),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(201);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBeDefined();
    expect(body.name).toBe("ベートーヴェン");
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
    expect(body.era).toBeUndefined();
    expect(body.region).toBeUndefined();
  });

  it("作成アイテムに UUID が付与される", async () => {
    mockRepo.save.mockResolvedValueOnce();
    const result = await handler(
      makeAdminEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/composers",
      }),
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

    mockRepo.save.mockResolvedValueOnce();
    const result = await handler(
      makeAdminEvent(TEST_USER_ID, {
        body: JSON.stringify(validInput),
        httpMethod: "POST",
        path: "/composers",
      }),
      mockContext,
      mockCallback
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.createdAt).toBe(now.toISOString());
    expect(body.updatedAt).toBe(now.toISOString());
    expect(body.createdAt).toBe(body.updatedAt);
  });

  describe("カテゴリフィールド", () => {
    it("era と region を指定して作成できる", async () => {
      mockRepo.save.mockResolvedValueOnce();
      const result = await handler(
        makeAdminEvent(TEST_USER_ID, {
          body: JSON.stringify({
            ...validInput,
            era: "古典派",
            region: "ドイツ・オーストリア",
          }),
          httpMethod: "POST",
          path: "/composers",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(201);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.era).toBe("古典派");
      expect(body.region).toBe("ドイツ・オーストリア");
    });

    it("era に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeAdminEvent(TEST_USER_ID, {
          body: JSON.stringify({ ...validInput, era: "不正な値" }),
          httpMethod: "POST",
          path: "/composers",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });

    it("region に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeAdminEvent(TEST_USER_ID, {
          body: JSON.stringify({ ...validInput, region: "不正な値" }),
          httpMethod: "POST",
          path: "/composers",
        }),
        mockContext,
        mockCallback
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
        path: "/composers",
      }),
      mockContext,
      mockCallback
    );
    expect(result?.statusCode).toBe(500);
  });

  describe("認可", () => {
    it("admin グループに属さないユーザーは 403 を返し、データを保存しない", async () => {
      const result = await handler(
        makeAuthEvent(TEST_USER_ID, {
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/composers",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(403);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("Admin privilege required");
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it("認証クレームがない場合は 403 を返し、データを保存しない", async () => {
      const result = await handler(
        makeEvent({ body: JSON.stringify(validInput), httpMethod: "POST", path: "/composers" }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(403);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });
});
