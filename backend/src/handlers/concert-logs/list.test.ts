import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ConcertLog } from "../../types";

import { handler } from "./list";
import { makeAuthEvent } from "../../test/fixtures";

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

const mockContext = {} as Parameters<typeof handler>[1];
const mockCallback = { signal: new AbortController().signal };

const TEST_USER_ID = "cognito-sub-user-123";
const mockEvent = makeAuthEvent(TEST_USER_ID);

const makeConcertLog = (id: string, concertDate: string, userId = TEST_USER_ID): ConcertLog => ({
  id,
  userId,
  title: "定期演奏会",
  concertDate,
  venue: "サントリーホール",
  createdAt: "2024-06-01T09:00:00.000Z",
  updatedAt: "2024-06-01T09:00:00.000Z",
});

describe("GET /concert-logs (list)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("空リストの場合は 200 で空配列を返す", async () => {
    mockRepo.findByUserId.mockResolvedValueOnce([]);
    const result = await handler(mockEvent, mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);
    expect(JSON.parse(result?.body ?? "[]")).toEqual([]);
  });

  it("concertDate の降順でソートして返す", async () => {
    const logs = [
      makeConcertLog("1", "2024-01-10T00:00:00.000Z"),
      makeConcertLog("2", "2024-01-15T00:00:00.000Z"),
      makeConcertLog("3", "2024-01-05T00:00:00.000Z"),
    ];
    mockRepo.findByUserId.mockResolvedValueOnce(logs);

    const result = await handler(mockEvent, mockContext, mockCallback);
    const body: ConcertLog[] = JSON.parse(result?.body ?? "[]");

    expect(body[0].id).toBe("2"); // 最新
    expect(body[1].id).toBe("1");
    expect(body[2].id).toBe("3"); // 最古
  });

  it("userId でフィルタリングして自分のログのみ返す", async () => {
    const logs = [makeConcertLog("1", "2024-01-10T00:00:00.000Z", TEST_USER_ID)];
    mockRepo.findByUserId.mockResolvedValueOnce(logs);

    await handler(mockEvent, mockContext, mockCallback);

    expect(mockRepo.findByUserId).toHaveBeenCalledWith(TEST_USER_ID);
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockRepo.findByUserId.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(mockEvent, mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
