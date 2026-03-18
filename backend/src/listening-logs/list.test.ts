import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import type { ListeningLog } from "../types";

import { handler } from "./list";
import * as dynamodb from "../utils/dynamodb";
import { makeLog } from "../test/fixtures";

vi.mock("../utils/dynamodb", () => ({
  scanAllItems: vi.fn(),
  TABLE_LISTENING_LOGS: "test-listening-logs",
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };
const mockEvent = {} as APIGatewayProxyEvent;

describe("GET /listening-logs (list)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("空リストの場合は 200 で空配列を返す", async () => {
    vi.mocked(dynamodb.scanAllItems).mockResolvedValueOnce([]);
    const result = await handler(mockEvent, mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);
    expect(JSON.parse(result?.body ?? "[]")).toEqual([]);
  });

  it("Items が undefined の場合も空配列を返す", async () => {
    vi.mocked(dynamodb.scanAllItems).mockResolvedValueOnce([]);
    const result = await handler(mockEvent, mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);
    expect(JSON.parse(result?.body ?? "[]")).toEqual([]);
  });

  it("listenedAt の降順でソートして返す", async () => {
    const logs = [
      makeLog("1", "2024-01-10T00:00:00.000Z"),
      makeLog("2", "2024-01-15T00:00:00.000Z"),
      makeLog("3", "2024-01-05T00:00:00.000Z"),
    ];
    vi.mocked(dynamodb.scanAllItems).mockResolvedValueOnce(logs);

    const result = await handler(mockEvent, mockContext, mockCallback);
    const body: ListeningLog[] = JSON.parse(result?.body ?? "[]");

    expect(body[0].id).toBe("2"); // 最新
    expect(body[1].id).toBe("1");
    expect(body[2].id).toBe("3"); // 最古
  });

  it("LastEvaluatedKey がある場合はページングして全件取得する", async () => {
    const page1 = [makeLog("1", "2024-01-10T00:00:00.000Z")];
    const page2 = [makeLog("2", "2024-01-15T00:00:00.000Z")];
    vi.mocked(dynamodb.scanAllItems).mockResolvedValueOnce([...page1, ...page2]);

    const result = await handler(mockEvent, mockContext, mockCallback);
    const body: ListeningLog[] = JSON.parse(result?.body ?? "[]");

    expect(dynamodb.scanAllItems).toHaveBeenCalledTimes(1);
    expect(body).toHaveLength(2);
    const sortedIds = [...page1, ...page2]
      .sort((a, b) => b.listenedAt.localeCompare(a.listenedAt))
      .map((l) => l.id);
    expect(body.map((l) => l.id)).toEqual(sortedIds);
  });

  it("DynamoDB エラー時に 500 を返す", async () => {
    vi.mocked(dynamodb.scanAllItems).mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(mockEvent, mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
