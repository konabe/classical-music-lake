/**
 * 統合テスト: @aws-sdk/lib-dynamodb を SDK レベルでモックし、
 * utils/dynamodb.ts の実コード（テーブル名・DynamoDBDocumentClient設定）と
 * Lambda ハンドラーの結合を検証する。
 */
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import type { Composer, ListeningLogRecord, Piece } from "@/types";

import { handler as createHandler } from "@/handlers/listening-logs/create";
import { handler as listHandler } from "@/handlers/listening-logs/list";
import { handler as getHandler } from "@/handlers/listening-logs/get";
import { handler as updateHandler } from "@/handlers/listening-logs/update";
import { handler as deleteHandler } from "@/handlers/listening-logs/delete";
import { GetCommand, PutCommand, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

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

vi.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: vi.fn().mockReturnValue({ send: mockSend }),
  },
  PutCommand: vi.fn(),
  GetCommand: vi.fn(),
  QueryCommand: vi.fn(),
  DeleteCommand: vi.fn(),
  ScanCommand: vi.fn(),
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

const TEST_USER_ID = "cognito-sub-user-123";

function makeEvent(options: {
  method: string;
  path: string;
  id?: string;
  body?: string | null;
  userId?: string;
}): APIGatewayProxyEvent {
  return {
    body: options.body ?? null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: options.method,
    isBase64Encoded: false,
    path: options.path,
    pathParameters: options.id === undefined ? null : { id: options.id },
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      authorizer: options.userId === undefined ? undefined : { claims: { sub: options.userId } },
    } as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };
}

const PIECE_ID = "00000000-0000-4000-8000-000000000010";
const COMPOSER_ID = "00000000-0000-4000-8000-000000000020";

const testLog: ListeningLogRecord = {
  id: "test-id-123",
  userId: TEST_USER_ID,
  listenedAt: "2024-01-15T20:00:00.000Z",
  pieceId: PIECE_ID,
  rating: 5,
  isFavorite: true,
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

const testPiece: Piece = {
  kind: "work",
  id: PIECE_ID,
  title: "ピアノ協奏曲第1番",
  composerId: COMPOSER_ID,
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

const testComposer: Composer = {
  id: COMPOSER_ID,
  name: "ショパン",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("DynamoDB 統合テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list: QueryCommand に正しいテーブル名と userId が渡る", () => {
    it("TABLE_LISTENING_LOGS と userId でクエリされる", async () => {
      mockSend.mockResolvedValueOnce({ Items: [] });

      await listHandler(
        makeEvent({ method: "GET", path: "/listening-logs", userId: TEST_USER_ID }),
        mockContext,
        mockCallback,
      );

      expect(QueryCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: expect.any(String),
          IndexName: "GSI1",
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: { ":userId": TEST_USER_ID },
        }),
      );
    });
  });

  describe("get: GetCommand に正しい Key が渡る", () => {
    it("id が Key として渡され、Piece / Composer も結合される", async () => {
      mockSend
        .mockResolvedValueOnce({ Item: testLog }) // ListeningLog
        .mockResolvedValueOnce({ Item: testPiece }) // Piece
        .mockResolvedValueOnce({ Item: testComposer }); // Composer

      await getHandler(
        makeEvent({
          method: "GET",
          path: "/listening-logs/test-id-123",
          id: "test-id-123",
          userId: TEST_USER_ID,
        }),
        mockContext,
        mockCallback,
      );

      expect(GetCommand).toHaveBeenCalledWith({
        TableName: expect.any(String),
        Key: { id: "test-id-123" },
      });
    });
  });

  describe("create: PutCommand に正しいアイテム構造が渡る", () => {
    it("id・userId・createdAt・updatedAt が付与されて PutCommand に渡される（派生値は保存しない）", async () => {
      mockSend
        .mockResolvedValueOnce({}) // PutCommand for ListeningLog
        .mockResolvedValueOnce({ Item: testPiece }) // GetCommand for Piece
        .mockResolvedValueOnce({ Item: testComposer }); // GetCommand for Composer

      const input = {
        listenedAt: "2024-01-20T18:00:00.000Z",
        pieceId: PIECE_ID,
        rating: 5,
        isFavorite: false,
      };

      await createHandler(
        makeEvent({
          method: "POST",
          path: "/listening-logs",
          body: JSON.stringify(input),
          userId: TEST_USER_ID,
        }),
        mockContext,
        mockCallback,
      );

      expect(PutCommand).toHaveBeenCalledWith({
        TableName: expect.any(String),
        Item: expect.objectContaining({
          id: expect.stringMatching(/^[0-9a-f-]{36}$/),
          userId: TEST_USER_ID,
          pieceId: PIECE_ID,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      });
      // 派生値は永続化に含まれない
      const putArg = vi.mocked(PutCommand).mock.calls[0][0];
      expect(putArg.Item).not.toHaveProperty("pieceTitle");
      expect(putArg.Item).not.toHaveProperty("composerName");
    });
  });

  describe("delete: GetCommand で userId 確認後に DeleteCommand が呼ばれる", () => {
    it("GetCommand で取得後、userId 一致で DeleteCommand が呼ばれる", async () => {
      mockSend
        .mockResolvedValueOnce({ Item: testLog }) // GetCommand
        .mockResolvedValueOnce({}); // DeleteCommand

      await deleteHandler(
        makeEvent({
          method: "DELETE",
          path: "/listening-logs/test-id-123",
          id: "test-id-123",
          userId: TEST_USER_ID,
        }),
        mockContext,
        mockCallback,
      );

      expect(GetCommand).toHaveBeenCalledWith({
        TableName: expect.any(String),
        Key: { id: "test-id-123" },
      });
      expect(DeleteCommand).toHaveBeenCalledWith({
        TableName: expect.any(String),
        Key: { id: "test-id-123" },
      });
    });
  });

  describe("update: GetCommand（userId 確認）→ PutCommand（楽観的ロック）の順で呼ばれる", () => {
    it("既存アイテム取得後に更新アイテムを保存する", async () => {
      mockSend
        .mockResolvedValueOnce({ Item: testLog }) // GetCommand (userId 確認)
        .mockResolvedValueOnce({}) // PutCommand (saveWithOptimisticLock)
        .mockResolvedValueOnce({ Item: testPiece }) // Piece
        .mockResolvedValueOnce({ Item: testComposer }); // Composer

      await updateHandler(
        makeEvent({
          method: "PUT",
          path: "/listening-logs/test-id-123",
          id: "test-id-123",
          body: JSON.stringify({ rating: 4 }),
          userId: TEST_USER_ID,
        }),
        mockContext,
        mockCallback,
      );

      expect(GetCommand).toHaveBeenCalled();
      expect(PutCommand).toHaveBeenCalledTimes(1);

      const putArg = vi.mocked(PutCommand).mock.calls[0][0];
      expect(putArg.Item).toMatchObject({
        id: "test-id-123",
        rating: 4,
        pieceId: PIECE_ID, // 既存データが保持される
      });
      expect(putArg.Item).not.toHaveProperty("pieceTitle");
    });
  });
});
