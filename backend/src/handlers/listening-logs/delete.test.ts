import { describe, it, expect, vi, beforeEach } from "vitest";

import { handler } from "./delete";
import {
  mockContext,
  mockCallback,
  TEST_USER_ID,
  OTHER_USER_ID,
  makeDeleteEvent,
} from "../../test/fixtures";

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

const existingItem = {
  id: "abc-123",
  userId: TEST_USER_ID,
  listenedAt: "2024-01-15T20:00:00.000Z",
  composer: "ベートーヴェン",
  piece: "交響曲第9番",
  rating: 5 as const,
  isFavorite: true,
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("DELETE /listening-logs/:id (delete)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    mockRepo.findById.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeDeleteEvent("listening-logs", "not-found-id", TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
  });

  it("他ユーザーのアイテムを削除しようとした場合は 404 を返す（存在を隠蔽）", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingItem);
    const result = await handler(
      makeDeleteEvent("listening-logs", "abc-123", OTHER_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
    expect(mockRepo.remove).not.toHaveBeenCalled();
  });

  it("userId が null のアイテム（未帰属データ）を削除しようとした場合は 404 を返す", async () => {
    const nullUserItem = { ...existingItem, userId: null };
    mockRepo.findById.mockResolvedValueOnce(nullUserItem);
    const result = await handler(
      makeDeleteEvent("listening-logs", "abc-123", TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
  });

  it("正常削除して 204 を返す", async () => {
    mockRepo.findById.mockResolvedValueOnce(existingItem);
    mockRepo.remove.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeDeleteEvent("listening-logs", "abc-123", TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(204);
    expect(result?.body).toBe("");
    expect(mockRepo.remove).toHaveBeenCalledTimes(1);
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockRepo.findById.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeDeleteEvent("listening-logs", "abc-123", TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(500);
  });
});
