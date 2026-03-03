import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import type { ListeningLog } from "../types";

import { handler } from "./list";
import { dynamo } from "../utils/dynamodb";

vi.mock("../utils/dynamodb", () => ({
  dynamo: { send: vi.fn() },
  TABLE_LISTENING_LOGS: "test-listening-logs",
}));

const mockContext = {} as Context;
const mockCallback = vi.fn();
const mockEvent = {} as APIGatewayProxyEvent;

function makeLog(id: string, listenedAt: string): ListeningLog {
  return {
    id,
    listenedAt,
    composer: "作曲家",
    piece: "曲名",
    performer: "演奏家",
    rating: 3,
    isFavorite: false,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };
}

describe("GET /listening-logs (list)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("空リストの場合は 200 で空配列を返す", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({ Items: [] });
    const result = await handler(mockEvent, mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);
    expect(JSON.parse(result?.body ?? "[]")).toEqual([]);
  });

  it("Items が undefined の場合も空配列を返す", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({});
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
    vi.mocked(dynamo.send).mockResolvedValueOnce({ Items: logs });

    const result = await handler(mockEvent, mockContext, mockCallback);
    const body: ListeningLog[] = JSON.parse(result?.body ?? "[]");

    expect(body[0].id).toBe("2"); // 最新
    expect(body[1].id).toBe("1");
    expect(body[2].id).toBe("3"); // 最古
  });

  it("DynamoDB エラー時に 500 を返す", async () => {
    vi.mocked(dynamo.send).mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(mockEvent, mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
