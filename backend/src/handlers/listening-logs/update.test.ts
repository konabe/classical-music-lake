import { Conflict } from "http-errors";

import { handler } from "@/handlers/listening-logs/update";
import {
  describeInvalidBodyCases,
  makeComposer,
  makeLogRecord,
  makePiece,
  makeUserPutEvent,
  mockCallback,
  mockContext,
  OTHER_USER_ID,
  TEST_USER_ID,
} from "@/test/fixtures";
import { mockComposerRepo } from "@/repositories/__mocks__/composer-repository";
import { mockListeningLogRepo } from "@/repositories/__mocks__/listening-log-repository";
import { mockPieceRepo } from "@/repositories/__mocks__/piece-repository";

vi.mock("@/repositories/composer-repository");
vi.mock("@/repositories/listening-log-repository");
vi.mock("@/repositories/piece-repository");

const makeEvent = (id?: string, body?: string | null, userId?: string) =>
  makeUserPutEvent("listening-logs", id, body, userId);

const existingLog = makeLogRecord("abc-123", "2024-01-15T20:00:00.000Z", TEST_USER_ID);

describe("PUT /listening-logs/:id (update)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPieceRepo.findById.mockResolvedValue(makePiece());
    mockComposerRepo.findById.mockResolvedValue(makeComposer());
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent(undefined, JSON.stringify({ rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  describeInvalidBodyCases(handler, "/listening-logs/abc-123", (body) =>
    makeEvent("abc-123", body, TEST_USER_ID),
  );

  it.each([0, 6, -1, 1.5, "5", null])(
    "rating が不正な値（%s）の場合は 400 を返す",
    async (invalidRating) => {
      const result = await handler(
        makeEvent("abc-123", JSON.stringify({ rating: invalidRating }), TEST_USER_ID),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toBe("rating must be between 1 and 5");
    },
  );

  it("memo が 1000 文字を超える場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ memo: "あ".repeat(1001) }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("memo must be 1000 characters or less");
  });

  it("listenedAt が不正なフォーマットの場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ listenedAt: "2024-01-15" }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
  });

  it("他ユーザーのアイテムを更新しようとした場合は 404 を返す", async () => {
    mockListeningLogRepo.findById.mockResolvedValueOnce(existingLog);
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 }), OTHER_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
    expect(mockListeningLogRepo.saveWithOptimisticLock).not.toHaveBeenCalled();
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    mockListeningLogRepo.findById.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeEvent("not-found-id", JSON.stringify({ rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
  });

  it("rating を含まない更新は rating のバリデーションをスキップする", async () => {
    mockListeningLogRepo.findById.mockResolvedValueOnce(existingLog);
    mockListeningLogRepo.saveWithOptimisticLock.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ isFavorite: true }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
  });

  it("正常更新して 200 を返す", async () => {
    mockListeningLogRepo.findById.mockResolvedValueOnce(existingLog);
    mockListeningLogRepo.saveWithOptimisticLock.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4, isFavorite: true }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBe("abc-123");
    expect(body.rating).toBe(4);
    expect(body.isFavorite).toBe(true);
    // 派生値が結合されている
    expect(body.pieceTitle).toBe("交響曲第5番 ハ短調 Op.67");
    expect(body.composerName).toBe("ベートーヴェン");
  });

  it("updatedAt が更新されること", async () => {
    mockListeningLogRepo.findById.mockResolvedValueOnce(existingLog);
    mockListeningLogRepo.saveWithOptimisticLock.mockResolvedValueOnce(undefined);

    const before = new Date(existingLog.updatedAt).getTime();
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(new Date(body.updatedAt).getTime()).toBeGreaterThanOrEqual(before);
  });

  it("id は上書きされない", async () => {
    mockListeningLogRepo.findById.mockResolvedValueOnce(existingLog);
    mockListeningLogRepo.saveWithOptimisticLock.mockResolvedValueOnce(undefined);

    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ id: "tampered-id", rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBe("abc-123");
  });

  it("pieceId を別の UUID に更新できる", async () => {
    mockListeningLogRepo.findById.mockResolvedValueOnce(existingLog);
    mockListeningLogRepo.saveWithOptimisticLock.mockResolvedValueOnce(undefined);

    const newPieceId = "00000000-0000-4000-8000-00000000aaaa";
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ pieceId: newPieceId }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(200);
    const body = JSON.parse(result?.body ?? "{}");
    expect(body.pieceId).toBe(newPieceId);
  });

  it("pieceId が UUID 形式でない場合は 400 を返す", async () => {
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ pieceId: "not-a-uuid" }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("pieceId must be a valid UUID");
  });

  it("楽観的ロック競合時に 409 を返す", async () => {
    mockListeningLogRepo.findById.mockResolvedValueOnce(existingLog);
    mockListeningLogRepo.saveWithOptimisticLock.mockRejectedValueOnce(
      new Conflict("Listening log was updated by another request"),
    );
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(409);
    expect(JSON.parse(result?.body ?? "{}").message).toBe(
      "Listening log was updated by another request",
    );
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockListeningLogRepo.findById.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeEvent("abc-123", JSON.stringify({ rating: 4 }), TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(500);
  });
});
