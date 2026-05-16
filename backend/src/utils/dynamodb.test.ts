import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";

import {
  putItemWithOptimisticLock,
  queryItemsByUserId,
  scanAllItems,
  scanPage,
} from "@/utils/dynamodb";

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

vi.mock("@aws-sdk/client-dynamodb", () => ({
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  DynamoDBClient: class DynamoDBClient {},
  ConditionalCheckFailedException: class ConditionalCheckFailedException extends Error {
    constructor(message?: string) {
      super(message);
      this.name = "ConditionalCheckFailedException";
    }
  },
}));

vi.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: vi.fn().mockReturnValue({ send: mockSend }),
  },
  PutCommand: class PutCommand {
    constructor(public input: unknown) {}
  },
  QueryCommand: class QueryCommand {
    constructor(public input: unknown) {}
  },
  ScanCommand: class ScanCommand {
    constructor(public input: unknown) {}
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("queryItemsByUserId", () => {
  it("ページネーションなしで全アイテムを返す", async () => {
    const items = [{ id: "1", userId: "user-1" }];
    mockSend.mockResolvedValueOnce({ Items: items, LastEvaluatedKey: undefined });

    const result = await queryItemsByUserId<{ id: string; userId: string }>("test-table", "user-1");

    expect(result).toEqual(items);
  });

  it("ページネーションが必要な場合に複数ページを取得する", async () => {
    const page1 = [{ id: "1" }];
    const page2 = [{ id: "2" }];
    mockSend
      .mockResolvedValueOnce({ Items: page1, LastEvaluatedKey: { id: "1" } })
      .mockResolvedValueOnce({ Items: page2, LastEvaluatedKey: undefined });

    const result = await queryItemsByUserId<{ id: string }>("test-table", "user-1");

    expect(result).toEqual([...page1, ...page2]);
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("Items が undefined の場合は空配列を返す", async () => {
    mockSend.mockResolvedValueOnce({ Items: undefined, LastEvaluatedKey: undefined });

    const result = await queryItemsByUserId("test-table", "user-1");

    expect(result).toEqual([]);
  });
});

describe("scanAllItems", () => {
  it("ページネーションなしで全アイテムを返す", async () => {
    const items = [{ id: "1" }, { id: "2" }];
    mockSend.mockResolvedValueOnce({ Items: items, LastEvaluatedKey: undefined });

    const result = await scanAllItems<{ id: string }>("test-table");

    expect(result).toEqual(items);
  });

  it("ページネーションが必要な場合に複数ページを取得する", async () => {
    const page1 = [{ id: "1" }];
    const page2 = [{ id: "2" }];
    mockSend
      .mockResolvedValueOnce({ Items: page1, LastEvaluatedKey: { id: "1" } })
      .mockResolvedValueOnce({ Items: page2, LastEvaluatedKey: undefined });

    const result = await scanAllItems<{ id: string }>("test-table");

    expect(result).toEqual([...page1, ...page2]);
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("Items が undefined の場合は空配列を返す", async () => {
    mockSend.mockResolvedValueOnce({ Items: undefined, LastEvaluatedKey: undefined });

    const result = await scanAllItems("test-table");

    expect(result).toEqual([]);
  });
});

describe("scanPage", () => {
  it("limit で指定した件数を要求する単発の Scan を実行する", async () => {
    const items = [{ id: "1" }, { id: "2" }];
    mockSend.mockResolvedValueOnce({ Items: items, LastEvaluatedKey: undefined });

    const result = await scanPage<{ id: string }>("test-table", { limit: 2 });

    expect(result.items).toEqual(items);
    expect(result.lastEvaluatedKey).toBeUndefined();
    expect(mockSend).toHaveBeenCalledTimes(1);
    const command = mockSend.mock.calls[0]?.[0] as { input: { Limit?: number } };
    expect(command.input.Limit).toBe(2);
  });

  it("exclusiveStartKey を Scan コマンドに引き渡す", async () => {
    mockSend.mockResolvedValueOnce({ Items: [], LastEvaluatedKey: undefined });
    const cursor = { id: "prev-id" };

    await scanPage("test-table", { limit: 50, exclusiveStartKey: cursor });

    const command = mockSend.mock.calls[0]?.[0] as {
      input: { ExclusiveStartKey?: Record<string, unknown> };
    };
    expect(command.input.ExclusiveStartKey).toEqual(cursor);
  });

  it("LastEvaluatedKey がある場合はそのまま返す", async () => {
    const key = { id: "next-id" };
    mockSend.mockResolvedValueOnce({ Items: [{ id: "1" }], LastEvaluatedKey: key });

    const result = await scanPage<{ id: string }>("test-table", { limit: 1 });

    expect(result.lastEvaluatedKey).toEqual(key);
  });

  it("Items が undefined の場合は空配列を返す", async () => {
    mockSend.mockResolvedValueOnce({ Items: undefined, LastEvaluatedKey: undefined });

    const result = await scanPage("test-table", { limit: 10 });

    expect(result.items).toEqual([]);
  });

  it("exclusiveStartKey が未指定でも動作する", async () => {
    mockSend.mockResolvedValueOnce({ Items: [], LastEvaluatedKey: undefined });

    await scanPage("test-table", { limit: 10 });

    const command = mockSend.mock.calls[0]?.[0] as {
      input: { ExclusiveStartKey?: Record<string, unknown> };
    };
    expect(command.input.ExclusiveStartKey).toBeUndefined();
  });
});

describe("putItemWithOptimisticLock", () => {
  it("指定アイテムを ConditionExpression 付きで Put する", async () => {
    mockSend.mockResolvedValueOnce({});
    const item = { id: "x", updatedAt: "2024-01-01T00:00:00.000Z" };

    await putItemWithOptimisticLock({
      tableName: "test-table",
      item,
      prevUpdatedAt: "2024-01-01T00:00:00.000Z",
      conflictMessage: "Test was updated by another request",
    });

    const command = mockSend.mock.calls[0]?.[0] as {
      input: {
        TableName: string;
        Item: unknown;
        ConditionExpression?: string;
        ExpressionAttributeValues?: Record<string, unknown>;
      };
    };
    expect(command.input.TableName).toBe("test-table");
    expect(command.input.Item).toEqual(item);
    expect(command.input.ConditionExpression).toBe("updatedAt = :prevUpdatedAt");
    expect(command.input.ExpressionAttributeValues).toEqual({
      ":prevUpdatedAt": "2024-01-01T00:00:00.000Z",
    });
  });

  it("ConditionalCheckFailedException が発生した場合は 409 を投げる", async () => {
    mockSend.mockRejectedValueOnce(
      new ConditionalCheckFailedException({ message: "Condition failed", $metadata: {} }),
    );

    await expect(
      putItemWithOptimisticLock({
        tableName: "test-table",
        item: { id: "x" },
        prevUpdatedAt: "prev",
        conflictMessage: "Custom was updated by another request",
      }),
    ).rejects.toThrow("Custom was updated by another request");
  });

  it("その他のエラーはそのまま再スローされる", async () => {
    mockSend.mockRejectedValueOnce(new Error("DynamoDB connection error"));

    await expect(
      putItemWithOptimisticLock({
        tableName: "test-table",
        item: { id: "x" },
        prevUpdatedAt: "prev",
        conflictMessage: "Whatever",
      }),
    ).rejects.toThrow("DynamoDB connection error");
  });
});
