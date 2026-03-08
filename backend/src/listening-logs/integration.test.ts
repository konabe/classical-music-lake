/**
 * 統合テスト: @aws-sdk/lib-dynamodb を SDK レベルでモックし、
 * utils/dynamodb.ts の実コード（テーブル名・DynamoDBDocumentClient設定）と
 * Lambda ハンドラーの結合を検証する。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import type { ListeningLog } from "../types";

import { handler as createHandler } from "./create";
import { handler as listHandler } from "./list";
import { handler as getHandler } from "./get";
import { handler as updateHandler } from "./update";
import { handler as deleteHandler } from "./delete";
import { ScanCommand, GetCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }));

vi.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: vi.fn(),
}));

vi.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: vi.fn().mockReturnValue({ send: mockSend }),
  },
  PutCommand: vi.fn(),
  GetCommand: vi.fn(),
  ScanCommand: vi.fn(),
  DeleteCommand: vi.fn(),
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

function makeEvent(options: {
  method: string;
  path: string;
  id?: string;
  body?: string | null;
}): APIGatewayProxyEvent {
  return {
    body: options.body ?? null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: options.method,
    isBase64Encoded: false,
    path: options.path,
    pathParameters: options.id ? { id: options.id } : null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };
}

const testLog: ListeningLog = {
  id: "test-id-123",
  listenedAt: "2024-01-15T20:00:00.000Z",
  composer: "ショパン",
  piece: "ピアノ協奏曲第1番",
  rating: 5,
  isFavorite: true,
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("DynamoDB 統合テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list: ScanCommand に正しいテーブル名が渡る", () => {
    it("TABLE_LISTENING_LOGS 環境変数のデフォルト値が使われる", async () => {
      mockSend.mockResolvedValueOnce({ Items: [] });

      await listHandler(
        makeEvent({ method: "GET", path: "/listening-logs" }),
        mockContext,
        mockCallback
      );

      expect(ScanCommand).toHaveBeenCalledWith({
        TableName: expect.any(String),
      });
      const callArg = vi.mocked(ScanCommand).mock.calls[0][0];
      expect(callArg.TableName).toBeDefined();
    });
  });

  describe("get: GetCommand に正しい Key が渡る", () => {
    it("id が Key として渡される", async () => {
      mockSend.mockResolvedValueOnce({ Item: testLog });

      await getHandler(
        makeEvent({ method: "GET", path: "/listening-logs/test-id-123", id: "test-id-123" }),
        mockContext,
        mockCallback
      );

      expect(GetCommand).toHaveBeenCalledWith({
        TableName: expect.any(String),
        Key: { id: "test-id-123" },
      });
    });
  });

  describe("create: PutCommand に正しいアイテム構造が渡る", () => {
    it("id・createdAt・updatedAt が付与されて PutCommand に渡される", async () => {
      mockSend.mockResolvedValueOnce({});

      const input = {
        listenedAt: "2024-01-20T18:00:00.000Z",
        composer: "バッハ",
        piece: "ゴルトベルク変奏曲",
        rating: 5,
        isFavorite: false,
      };

      await createHandler(
        makeEvent({ method: "POST", path: "/listening-logs", body: JSON.stringify(input) }),
        mockContext,
        mockCallback
      );

      expect(PutCommand).toHaveBeenCalledWith({
        TableName: expect.any(String),
        Item: expect.objectContaining({
          id: expect.stringMatching(/^[0-9a-f-]{36}$/),
          composer: "バッハ",
          piece: "ゴルトベルク変奏曲",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      });
    });
  });

  describe("delete: DeleteCommand に正しい Key が渡る", () => {
    it("id が Key として渡される", async () => {
      mockSend.mockResolvedValueOnce({});

      await deleteHandler(
        makeEvent({ method: "DELETE", path: "/listening-logs/test-id-123", id: "test-id-123" }),
        mockContext,
        mockCallback
      );

      expect(DeleteCommand).toHaveBeenCalledWith({
        TableName: expect.any(String),
        Key: { id: "test-id-123" },
      });
    });
  });

  describe("update: GetCommand → PutCommand の順で呼ばれる", () => {
    it("既存アイテム取得後に更新アイテムを保存する", async () => {
      mockSend
        .mockResolvedValueOnce({ Item: testLog }) // GetCommand
        .mockResolvedValueOnce({}); // PutCommand

      await updateHandler(
        makeEvent({
          method: "PUT",
          path: "/listening-logs/test-id-123",
          id: "test-id-123",
          body: JSON.stringify({ rating: 4 }),
        }),
        mockContext,
        mockCallback
      );

      expect(GetCommand).toHaveBeenCalledTimes(1);
      expect(PutCommand).toHaveBeenCalledTimes(1);

      const putArg = vi.mocked(PutCommand).mock.calls[0][0];
      expect(putArg.Item).toMatchObject({
        id: "test-id-123",
        rating: 4,
        composer: "ショパン", // 既存データが保持される
      });
    });
  });
});
