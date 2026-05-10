import { describe, it, expect, vi, beforeEach } from "vitest";

import { handler } from "./delete";
import {
  mockContext,
  mockCallback,
  TEST_USER_ID,
  OTHER_USER_ID,
  makeDeleteEvent,
  makeLogRecord,
} from "../../test/fixtures";

const mocks = vi.hoisted(() => ({
  listeningLogRepo: {
    save: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    existsByPieceIds: vi.fn(),
    saveWithOptimisticLock: vi.fn(),
    remove: vi.fn(),
  },
  pieceRepo: {
    findRootById: vi.fn(),
    findRootPage: vi.fn(),
    saveWork: vi.fn(),
    saveWorkWithOptimisticLock: vi.fn(),
    removeWorkCascade: vi.fn(),
    findById: vi.fn(),
    findChildren: vi.fn(),
    saveMovement: vi.fn(),
    saveMovementWithOptimisticLock: vi.fn(),
    removeMovement: vi.fn(),
    replaceMovements: vi.fn(),
  },
  composerRepo: {
    findById: vi.fn(),
    findPage: vi.fn(),
    save: vi.fn(),
    saveWithOptimisticLock: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("../../repositories/listening-log-repository", () => ({
  DynamoDBListeningLogRepository: vi.fn().mockImplementation(function () {
    return mocks.listeningLogRepo;
  }),
}));
vi.mock("../../repositories/piece-repository", () => ({
  DynamoDBPieceRepository: vi.fn().mockImplementation(function () {
    return mocks.pieceRepo;
  }),
}));
vi.mock("../../repositories/composer-repository", () => ({
  DynamoDBComposerRepository: vi.fn().mockImplementation(function () {
    return mocks.composerRepo;
  }),
}));

describe("DELETE /listening-logs/:id (delete)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const ownItem = makeLogRecord("abc-123", "2024-01-15T20:00:00.000Z", TEST_USER_ID);

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(
      makeDeleteEvent("listening-logs", undefined, TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    mocks.listeningLogRepo.findById.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeDeleteEvent("listening-logs", "not-found-id", TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
  });

  it("他ユーザーのアイテムを削除しようとした場合は 404 を返す（存在を隠蔽）", async () => {
    mocks.listeningLogRepo.findById.mockResolvedValueOnce(ownItem);
    const result = await handler(
      makeDeleteEvent("listening-logs", "abc-123", OTHER_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
    expect(mocks.listeningLogRepo.remove).not.toHaveBeenCalled();
  });

  it("userId が null のアイテム（未帰属データ）を削除しようとした場合は 404 を返す", async () => {
    mocks.listeningLogRepo.findById.mockResolvedValueOnce({ ...ownItem, userId: null });
    const result = await handler(
      makeDeleteEvent("listening-logs", "abc-123", TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
  });

  it("正常削除して 204 を返す", async () => {
    mocks.listeningLogRepo.findById.mockResolvedValueOnce(ownItem);
    mocks.listeningLogRepo.remove.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeDeleteEvent("listening-logs", "abc-123", TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(204);
    expect(result?.body).toBe("");
    expect(mocks.listeningLogRepo.remove).toHaveBeenCalledTimes(1);
  });

  it("Repository エラー時に 500 を返す", async () => {
    mocks.listeningLogRepo.findById.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeDeleteEvent("listening-logs", "abc-123", TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(500);
  });
});
