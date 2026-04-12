import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";

import { queryItemsByUserId, scanAllItems, scanPage, updateItem } from "./dynamodb";

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
  GetCommand: class GetCommand {
    constructor(public input: unknown) {}
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

type TestItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
};

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

describe("updateItem", () => {
  const existing: TestItem = {
    id: "item-1",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    name: "original",
  };

  it("アイテムが存在しない場合は 404 を投げる", async () => {
    mockSend.mockResolvedValueOnce({ Item: undefined });

    await expect(updateItem<TestItem>("test-table", "item-1", { name: "updated" })).rejects.toThrow(
      "Item not found"
    );
  });

  it("正常に更新されたアイテムを返す", async () => {
    mockSend.mockResolvedValueOnce({ Item: existing }).mockResolvedValueOnce({});

    const result = await updateItem<TestItem>("test-table", "item-1", { name: "updated" });

    expect(result.name).toBe("updated");
    expect(result.id).toBe("item-1");
    expect(result.createdAt).toBe(existing.createdAt);
    expect(result.updatedAt).not.toBe(existing.updatedAt);
  });

  it("updatedAt が更新される", async () => {
    mockSend.mockResolvedValueOnce({ Item: existing }).mockResolvedValueOnce({});

    const result = await updateItem<TestItem>("test-table", "item-1", {});

    expect(result.updatedAt).not.toBe(existing.updatedAt);
  });

  it("id と createdAt は変更されない", async () => {
    mockSend.mockResolvedValueOnce({ Item: existing }).mockResolvedValueOnce({});

    const result = await updateItem<TestItem>("test-table", "item-1", {
      id: "different-id",
      createdAt: "2099-01-01T00:00:00.000Z",
    } as Partial<TestItem>);

    expect(result.id).toBe("item-1");
    expect(result.createdAt).toBe(existing.createdAt);
  });

  it("ConditionalCheckFailedException が発生した場合は 409 を投げる", async () => {
    mockSend
      .mockResolvedValueOnce({ Item: existing })
      .mockRejectedValueOnce(
        new ConditionalCheckFailedException({ message: "Condition failed", $metadata: {} })
      );

    await expect(updateItem("test-table", "item-1", {})).rejects.toThrow(
      "Item was updated by another request"
    );
  });

  it("その他のエラーはそのまま再スローされる", async () => {
    mockSend
      .mockResolvedValueOnce({ Item: existing })
      .mockRejectedValueOnce(new Error("DynamoDB connection error"));

    await expect(updateItem("test-table", "item-1", {})).rejects.toThrow(
      "DynamoDB connection error"
    );
  });
});
