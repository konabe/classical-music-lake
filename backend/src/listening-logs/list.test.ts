import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import type { ListeningLog } from "../types";

import { handler } from "./list";
import { dynamo } from "../utils/dynamodb";

vi.mock("../utils/dynamodb", () => ({
  dynamo: { send: vi.fn() },
  TABLE_LISTENING_LOGS: "test-listening-logs",
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };
const mockEvent = {} as APIGatewayProxyEvent;

function makeLog(id: string, listenedAt: string): ListeningLog {
  return {
    id,
    listenedAt,
    composer: "作曲家",
    piece: "曲名",
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
    vi.mocked(dynamo.send).mockResolvedValueOnce({ Items: [] } as never);
    const result = await handler(mockEvent, mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);
    expect(JSON.parse(result?.body ?? "[]")).toEqual([]);
  });

  it("Items が undefined の場合も空配列を返す", async () => {
    vi.mocked(dynamo.send).mockResolvedValueOnce({} as never);
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
    vi.mocked(dynamo.send).mockResolvedValueOnce({ Items: logs } as never);

    const result = await handler(mockEvent, mockContext, mockCallback);
    const body: ListeningLog[] = JSON.parse(result?.body ?? "[]");

    expect(body[0].id).toBe("2"); // 最新
    expect(body[1].id).toBe("1");
    expect(body[2].id).toBe("3"); // 最古
  });

  it("LastEvaluatedKey がある場合はページングして全件取得する", async () => {
    const page1 = [makeLog("1", "2024-01-10T00:00:00.000Z")];
    const page2 = [makeLog("2", "2024-01-15T00:00:00.000Z")];
    vi.mocked(dynamo.send)
      .mockResolvedValueOnce({ Items: page1, LastEvaluatedKey: { id: "1" } } as never)
      .mockResolvedValueOnce({ Items: page2 } as never);

    const result = await handler(mockEvent, mockContext, mockCallback);
    const body: ListeningLog[] = JSON.parse(result?.body ?? "[]");

    expect(dynamo.send).toHaveBeenCalledTimes(2);
    const secondCall = vi.mocked(dynamo.send).mock.calls[1]?.[0] as ScanCommand;
    expect(secondCall.input.ExclusiveStartKey).toEqual({ id: "1" });
    expect(body).toHaveLength(2);
    const sortedIds = [...page1, ...page2]
      .sort((a, b) => b.listenedAt.localeCompare(a.listenedAt))
      .map((l) => l.id);
    expect(body.map((l) => l.id)).toEqual(sortedIds);
  });

  it("DynamoDB エラー時に 500 を返す", async () => {
    vi.mocked(dynamo.send).mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(mockEvent, mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
