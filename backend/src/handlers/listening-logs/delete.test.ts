import { handler } from "@/handlers/listening-logs/delete";
import {
  mockContext,
  mockCallback,
  TEST_USER_ID,
  OTHER_USER_ID,
  makeDeleteEvent,
  makeLogRecord,
} from "@/test/fixtures";
import { mockListeningLogRepo } from "@/repositories/__mocks__/listening-log-repository";

vi.mock("@/repositories/composer-repository");
vi.mock("@/repositories/listening-log-repository");
vi.mock("@/repositories/piece-repository");

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
    mockListeningLogRepo.findById.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeDeleteEvent("listening-logs", "not-found-id", TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
  });

  it("他ユーザーのアイテムを削除しようとした場合は 404 を返す（存在を隠蔽）", async () => {
    mockListeningLogRepo.findById.mockResolvedValueOnce(ownItem);
    const result = await handler(
      makeDeleteEvent("listening-logs", "abc-123", OTHER_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
    expect(mockListeningLogRepo.remove).not.toHaveBeenCalled();
  });

  it("正常削除して 204 を返す", async () => {
    mockListeningLogRepo.findById.mockResolvedValueOnce(ownItem);
    mockListeningLogRepo.remove.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeDeleteEvent("listening-logs", "abc-123", TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(204);
    expect(result?.body).toBe("");
    expect(mockListeningLogRepo.remove).toHaveBeenCalledTimes(1);
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockListeningLogRepo.findById.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(
      makeDeleteEvent("listening-logs", "abc-123", TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(500);
  });
});
