import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import { ComposerId } from "@/domain/value-objects/ids";
import { DynamoDBTableRepository } from "@/repositories/dynamodb-table-repository";

const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }));

vi.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: vi.fn(),
  ConditionalCheckFailedException: class ConditionalCheckFailedException extends Error {
    constructor(message?: string) {
      super(message);
      this.name = "ConditionalCheckFailedException";
    }
  },
}));

vi.mock("@aws-sdk/lib-dynamodb", async () => {
  const actual =
    await vi.importActual<typeof import("@aws-sdk/lib-dynamodb")>("@aws-sdk/lib-dynamodb");
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: vi.fn().mockReturnValue({ send: mockSend }),
    },
  };
});

type TestItem = { id: string; name: string; updatedAt: string };

class TestRepository extends DynamoDBTableRepository<TestItem, ComposerId> {
  protected readonly tableName = "test-table";
  protected readonly conflictMessage = "Test item was updated by another request";
}

const ITEM_ID = "00000000-0000-4000-8000-000000000001";
const OTHER_ID = "00000000-0000-4000-8000-000000000002";

const baseItem: TestItem = {
  id: ITEM_ID,
  name: "テスト",
  updatedAt: "2024-01-15T20:00:00.000Z",
};

describe("DynamoDBTableRepository", () => {
  const repo = new TestRepository();

  beforeEach(() => {
    mockSend.mockReset();
  });

  describe("findById", () => {
    it("GetCommand にテーブル名と id を渡し、Item を返す", async () => {
      mockSend.mockResolvedValueOnce({ Item: baseItem });
      const result = await repo.findById(ComposerId.from(ITEM_ID));
      expect(result).toEqual(baseItem);
      const command = mockSend.mock.calls[0]![0] as GetCommand;
      expect(command).toBeInstanceOf(GetCommand);
      expect(command.input).toEqual({ TableName: "test-table", Key: { id: ITEM_ID } });
    });

    it("Item が無い場合は undefined を返す", async () => {
      mockSend.mockResolvedValueOnce({});
      const result = await repo.findById(ComposerId.from(ITEM_ID));
      expect(result).toBeUndefined();
    });
  });

  describe("findByIds", () => {
    it("空配列のときは DynamoDB にアクセスせず空配列を返す", async () => {
      const result = await repo.findByIds([]);
      expect(result).toEqual([]);
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("見つかったアイテムのみを返す（undefined は除外）", async () => {
      mockSend.mockResolvedValueOnce({ Item: baseItem }).mockResolvedValueOnce({ Item: undefined });
      const result = await repo.findByIds([ComposerId.from(ITEM_ID), ComposerId.from(OTHER_ID)]);
      expect(result).toEqual([baseItem]);
      expect(mockSend).toHaveBeenCalledTimes(2);
    });
  });

  describe("save", () => {
    it("PutCommand にテーブル名とアイテムを渡す", async () => {
      mockSend.mockResolvedValueOnce({});
      await repo.save(baseItem);
      const command = mockSend.mock.calls[0]![0] as PutCommand;
      expect(command).toBeInstanceOf(PutCommand);
      expect(command.input).toEqual({ TableName: "test-table", Item: baseItem });
    });
  });

  describe("saveWithOptimisticLock", () => {
    it("updatedAt を条件式にした PutCommand を発行する", async () => {
      mockSend.mockResolvedValueOnce({});
      await repo.saveWithOptimisticLock(baseItem, "2024-01-01T00:00:00.000Z");
      const command = mockSend.mock.calls[0]![0] as PutCommand;
      expect(command).toBeInstanceOf(PutCommand);
      expect(command.input).toEqual({
        TableName: "test-table",
        Item: baseItem,
        ConditionExpression: "updatedAt = :prevUpdatedAt",
        ExpressionAttributeValues: { ":prevUpdatedAt": "2024-01-01T00:00:00.000Z" },
      });
    });

    it("条件不一致のときは conflictMessage を持つ 409 Conflict を投げる", async () => {
      const { ConditionalCheckFailedException } = await import("@aws-sdk/client-dynamodb");
      mockSend.mockRejectedValueOnce(new ConditionalCheckFailedException("conditional failed"));
      await expect(
        repo.saveWithOptimisticLock(baseItem, "2024-01-01T00:00:00.000Z"),
      ).rejects.toMatchObject({
        status: 409,
        message: "Test item was updated by another request",
      });
    });
  });

  describe("remove", () => {
    it("DeleteCommand にテーブル名と id を渡す", async () => {
      mockSend.mockResolvedValueOnce({});
      await repo.remove(ComposerId.from(ITEM_ID));
      const command = mockSend.mock.calls[0]![0] as DeleteCommand;
      expect(command).toBeInstanceOf(DeleteCommand);
      expect(command.input).toEqual({ TableName: "test-table", Key: { id: ITEM_ID } });
    });
  });
});
