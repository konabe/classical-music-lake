import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent } from "aws-lambda";
import createError from "http-errors";
import type { Piece, PieceWork } from "../../types";

import { handler } from "./update";
import {
  makeAdminEvent,
  makeAuthEvent,
  makeEvent as makeBaseEvent,
  mockCallback,
  mockContext,
  TEST_COMPOSER_ID,
  TEST_USER_ID,
} from "../../test/fixtures";

const mockRepo = vi.hoisted(() => ({
  saveWork: vi.fn(),
  saveWorkWithOptimisticLock: vi.fn(),
  removeWorkCascade: vi.fn(),
  findRootById: vi.fn(),
  findRootPage: vi.fn(),
  findById: vi.fn(),
  findChildren: vi.fn(),
  saveMovement: vi.fn(),
  saveMovementWithOptimisticLock: vi.fn(),
  removeMovement: vi.fn(),
  replaceMovements: vi.fn(),
}));

vi.mock("../../repositories/piece-repository", () => ({
  DynamoDBPieceRepository: vi.fn().mockImplementation(function () {
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
    path: `/pieces/${id ?? ""}`,
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

const existingPiece: PieceWork = {
  kind: "work",
  id: "abc-123",
  title: "交響曲第9番",
  composerId: TEST_COMPOSER_ID,
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

const OTHER_COMPOSER_ID = "00000000-0000-4000-8000-000000000002";

const existingPieceWithVideoUrls: PieceWork = {
  ...existingPiece,
  videoUrls: ["https://www.youtube.com/watch?v=abc123"],
};

const work = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({ kind: "work", ...overrides });

describe("PUT /pieces/{id} (update)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent(undefined, work({ title: "新タイトル" })),
      mockContext,
      mockCallback,
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
      const result = await handler(makeEvent("abc-123", body), mockContext, mockCallback);
      expect(result?.statusCode).toBe(statusCode);
      expect(JSON.parse(result?.body ?? "{}").message).toBe(message);
    });
  });

  it.each(["", "   ", "\t", "\n"])(
    "title が空または空白のみ（%j）の場合は 400 を返す",
    async (invalidTitle) => {
      const result = await handler(
        makeEvent("abc-123", work({ title: invalidTitle })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("title must be a non-empty string");
    },
  );

  it("title が 200 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", work({ title: "あ".repeat(201) })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("title must be 200 characters or less");
  });

  it.each(["", "not-a-uuid", "   "])(
    "composerId が UUID 形式でない（%j）場合は 400 を返す",
    async (invalidComposerId) => {
      const result = await handler(
        makeEvent("abc-123", work({ composerId: invalidComposerId })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("composerId must be a valid UUID");
    },
  );

  it("title を含まない更新は title のバリデーションをスキップする", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingPiece);
    mockRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent("abc-123", work({ composerId: OTHER_COMPOSER_ID })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    mockRepo.findById.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeEvent("not-found-id", work({ title: "新タイトル" })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
  });

  it("正常更新して 200 を返す", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingPiece);
    mockRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent("abc-123", work({ title: "交響曲第5番", composerId: OTHER_COMPOSER_ID })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.kind).toBe("work");
    expect(body.id).toBe("abc-123");
    expect(body.title).toBe("交響曲第5番");
    expect((body as PieceWork).composerId).toBe(OTHER_COMPOSER_ID);
  });

  it("updatedAt が更新されること", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingPiece);
    mockRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

    const before = new Date(existingPiece.updatedAt).getTime();
    const result = await handler(
      makeEvent("abc-123", work({ title: "交響曲第5番" })),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(new Date(body.updatedAt).getTime()).toBeGreaterThanOrEqual(before);
  });

  it("createdAt は上書きされない", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingPiece);
    mockRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent("abc-123", work({ title: "交響曲第5番" })),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.createdAt).toBe(existingPiece.createdAt);
  });

  it("id は上書きされない", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingPiece);
    mockRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent("abc-123", work({ title: "交響曲第5番" })),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.id).toBe("abc-123");
  });

  it("楽観的ロック競合時に 409 を返す", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingPiece);
    mockRepo.saveWorkWithOptimisticLock.mockRejectedValueOnce(
      new createError.Conflict("Piece was updated by another request"),
    );

    const result = await handler(
      makeEvent("abc-123", work({ title: "交響曲第5番" })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(409);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Piece was updated by another request");
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockRepo.findById.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeEvent("abc-123", work({ title: "交響曲第5番" })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(500);
  });

  it("videoUrls を追加して更新できる", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingPiece);
    mockRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

    const urls = ["https://www.youtube.com/watch?v=xyz", "https://www.youtube.com/watch?v=qrs"];
    const result = await handler(
      makeEvent("abc-123", work({ videoUrls: urls })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.videoUrls).toEqual(urls);
  });

  it("videoUrls を空配列で送信すると削除される", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingPieceWithVideoUrls);
    mockRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent("abc-123", work({ videoUrls: [] })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.videoUrls).toBeUndefined();
  });

  describe("カテゴリフィールド", () => {
    it("カテゴリを追加して更新できる", async () => {
      mockRepo.findById.mockResolvedValueOnce(existingPiece);
      mockRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

      const result = await handler(
        makeEvent(
          "abc-123",
          work({
            genre: "交響曲",
            era: "古典派",
            formation: "管弦楽",
            region: "ドイツ・オーストリア",
          }),
        ),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}") as PieceWork;
      expect(body.genre).toBe("交響曲");
      expect(body.era).toBe("古典派");
      expect(body.formation).toBe("管弦楽");
      expect(body.region).toBe("ドイツ・オーストリア");
    });

    it("カテゴリを変更して更新できる", async () => {
      const existingWithCategory: PieceWork = {
        ...existingPiece,
        genre: "交響曲",
        era: "古典派",
      };
      mockRepo.findById.mockResolvedValueOnce(existingWithCategory);
      mockRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

      const result = await handler(
        makeEvent("abc-123", work({ genre: "協奏曲", era: "ロマン派" })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}") as PieceWork;
      expect(body.genre).toBe("協奏曲");
      expect(body.era).toBe("ロマン派");
    });

    it("カテゴリを空文字で送信すると削除される", async () => {
      const existingWithCategory: PieceWork = {
        ...existingPiece,
        genre: "交響曲",
        era: "古典派",
        formation: "管弦楽",
        region: "ドイツ・オーストリア",
      };
      mockRepo.findById.mockResolvedValueOnce(existingWithCategory);
      mockRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

      const result = await handler(
        makeEvent("abc-123", work({ genre: "", era: "", formation: "", region: "" })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}") as PieceWork;
      expect(body.genre).toBeUndefined();
      expect(body.era).toBeUndefined();
      expect(body.formation).toBeUndefined();
      expect(body.region).toBeUndefined();
    });

    it("一部のカテゴリのみ更新できる", async () => {
      mockRepo.findById.mockResolvedValueOnce(existingPiece);
      mockRepo.saveWorkWithOptimisticLock.mockResolvedValueOnce(undefined);

      const result = await handler(
        makeEvent("abc-123", work({ genre: "室内楽" })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}") as PieceWork;
      expect(body.genre).toBe("室内楽");
      expect(body.era).toBeUndefined();
    });

    it("genre に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeEvent("abc-123", work({ genre: "不正な値" })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });

    it("era に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeEvent("abc-123", work({ era: "不正な値" })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });

    it("formation に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeEvent("abc-123", work({ formation: "不正な値" })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });

    it("region に不正な値を指定すると 400 を返す", async () => {
      const result = await handler(
        makeEvent("abc-123", work({ region: "不正な値" })),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });
  });

  it("videoUrls の要素に不正な URL が含まれる場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", work({ videoUrls: ["not-a-url"] })),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("videoUrls must contain valid URLs");
  });

  describe("認可", () => {
    it("admin グループに属さないユーザーは 403 を返し、データを更新しない", async () => {
      const result = await handler(
        makeEvent("abc-123", work({ title: "新タイトル" }), "non-admin"),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(403);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("Admin privilege required");
      expect(mockRepo.findById).not.toHaveBeenCalled();
      expect(mockRepo.saveWorkWithOptimisticLock).not.toHaveBeenCalled();
    });

    it("認証クレームがない場合は 403 を返し、データを更新しない", async () => {
      const result = await handler(
        makeEvent("abc-123", work({ title: "新タイトル" }), "none"),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(403);
      expect(mockRepo.findById).not.toHaveBeenCalled();
      expect(mockRepo.saveWorkWithOptimisticLock).not.toHaveBeenCalled();
    });
  });
});
