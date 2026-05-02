import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent } from "aws-lambda";
import createError from "http-errors";
import type { Composer } from "../../types";

import { handler } from "./update";
import {
  makeAdminEvent,
  makeAuthEvent,
  makeEvent as makeBaseEvent,
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

type AuthMode = "admin" | "non-admin" | "none";

function makeEvent(
  id?: string,
  body?: string | null,
  auth: AuthMode = "admin",
): APIGatewayProxyEvent {
  const overrides: Partial<APIGatewayProxyEvent> = {
    body: body === undefined ? null : body,
    httpMethod: "PUT",
    path: `/composers/${id ?? ""}`,
    pathParameters: id === undefined ? null : { id },
  };
  if (auth === "admin") {
    return makeAdminEvent(TEST_USER_ID, overrides);
  }
  if (auth === "non-admin") {
    return makeAuthEvent(TEST_USER_ID, overrides);
  }
  return makeBaseEvent(overrides);
}

const existingComposer: Composer = {
  id: "abc-123",
  name: "ベートーヴェン",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("PUT /composers/{id} (update)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent(undefined, JSON.stringify({ name: "新しい名前" })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  it.each(["", "   ", "\t"])(
    "name が空または空白のみ（%j）の場合は 400 を返す",
    async (invalidName) => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ name: invalidName })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("name must be a non-empty string");
    },
  );

  it("name が 100 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ name: "あ".repeat(101) })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("name must be 100 characters or less");
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    mockRepo.findById.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeEvent("not-found-id", JSON.stringify({ name: "新しい名前" })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
  });

  it("正常更新して 200 を返す", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingComposer);
    mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ name: "モーツァルト" })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}") as Composer;
    expect(body.id).toBe("abc-123");
    expect(body.name).toBe("モーツァルト");
  });

  it("createdAt は上書きされない", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingComposer);
    mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ name: "モーツァルト" })),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}") as Composer;
    expect(body.createdAt).toBe(existingComposer.createdAt);
  });

  it("era と region を追加して更新できる", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingComposer);
    mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ era: "古典派", region: "ドイツ・オーストリア" })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}") as Composer;
    expect(body.era).toBe("古典派");
    expect(body.region).toBe("ドイツ・オーストリア");
  });

  it("era を空文字で送信すると削除される", async () => {
    const existing: Composer = {
      ...existingComposer,
      era: "古典派",
      region: "ドイツ・オーストリア",
    };
    mockRepo.findById.mockResolvedValueOnce(existing);
    mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ era: "", region: "" })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}") as Composer;
    expect(body.era).toBeUndefined();
    expect(body.region).toBeUndefined();
  });

  it("imageUrl を追加して更新できる", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingComposer);
    mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

    const result = await handler(
      makeEvent(
        "abc-123",
        JSON.stringify({
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Beethoven.jpg",
        }),
      ),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}") as Composer;
    expect(body.imageUrl).toBe("https://upload.wikimedia.org/wikipedia/commons/6/6f/Beethoven.jpg");
  });

  it("birthYear と deathYear を追加して更新できる", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingComposer);
    mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ birthYear: 1770, deathYear: 1827 })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}") as Composer;
    expect(body.birthYear).toBe(1770);
    expect(body.deathYear).toBe(1827);
  });

  it("birthYear を null で送信すると削除される", async () => {
    const existing: Composer = { ...existingComposer, birthYear: 1770, deathYear: 1827 };
    mockRepo.findById.mockResolvedValueOnce(existing);
    mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ birthYear: null, deathYear: null })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}") as Composer;
    expect(body.birthYear).toBeUndefined();
    expect(body.deathYear).toBeUndefined();
  });

  it("birthYear が非整数の場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ birthYear: 1770.5 })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("birthYear must be an integer");
  });

  it("imageUrl を空文字で送信すると削除される", async () => {
    const existing: Composer = {
      ...existingComposer,
      imageUrl: "https://example.com/beethoven.jpg",
    };
    mockRepo.findById.mockResolvedValueOnce(existing);
    mockRepo.saveWithOptimisticLock.mockResolvedValueOnce();

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ imageUrl: "" })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}") as Composer;
    expect(body.imageUrl).toBeUndefined();
  });

  it("imageUrl に不正な URL を指定すると 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ imageUrl: "not-a-url" })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("imageUrl must be a valid URL");
  });

  it("楽観的ロック競合時に 409 を返す", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingComposer);
    mockRepo.saveWithOptimisticLock.mockRejectedValueOnce(
      new createError.Conflict("Composer was updated by another request"),
    );

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ name: "モーツァルト" })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(409);
  });

  describe("認可", () => {
    it("admin グループに属さないユーザーは 403 を返し、データを更新しない", async () => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ name: "新しい名前" }), "non-admin"),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(403);
      expect(mockRepo.findById).not.toHaveBeenCalled();
      expect(mockRepo.saveWithOptimisticLock).not.toHaveBeenCalled();
    });

    it("認証クレームがない場合は 403 を返し、データを更新しない", async () => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ name: "新しい名前" }), "none"),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(403);
      expect(mockRepo.findById).not.toHaveBeenCalled();
    });
  });
});
