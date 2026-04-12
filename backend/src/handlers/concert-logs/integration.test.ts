/**
 * 統合テスト: @aws-sdk/lib-dynamodb を SDK レベルでモックし、
 * utils/dynamodb.ts の実コード（テーブル名・DynamoDBDocumentClient設定）と
 * Lambda ハンドラーの結合を検証する。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import type { ConcertLog } from "../../types";

import { handler as createHandler } from "./create";
import { handler as listHandler } from "./list";
import { handler as getHandler } from "./get";
import { handler as deleteHandler } from "./delete";
import { GetCommand, PutCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

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

const TEST_USER_ID = "cognito-sub-user-456";

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

const testLog: ConcertLog = {
  id: "cl-test-123",
  userId: TEST_USER_ID,
  title: "定期演奏会 第100回",
  concertDate: "2024-03-01T19:00:00.000Z",
  venue: "サントリーホール",
  conductor: "カラヤン",
  createdAt: "2024-03-01T20:00:00.000Z",
  updatedAt: "2024-03-01T20:00:00.000Z",
};

describe("DynamoDB 統合テスト（concert-logs）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list: QueryCommand に正しいテーブル名と userId が渡る", () => {
    it("TABLE_CONCERT_LOGS と userId でクエリされる", async () => {
      mockSend.mockResolvedValueOnce({ Items: [] });

      await listHandler(
        makeEvent({ method: "GET", path: "/concert-logs", userId: TEST_USER_ID }),
        mockContext,
        mockCallback
      );

      expect(QueryCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: expect.any(String),
          IndexName: "GSI1",
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: { ":userId": TEST_USER_ID },
        })
      );
    });
  });

  describe("get: GetCommand に正しい Key が渡る", () => {
    it("id が Key として渡され、userId が照合される", async () => {
      mockSend.mockResolvedValueOnce({ Item: testLog });

      await getHandler(
        makeEvent({
          method: "GET",
          path: "/concert-logs/cl-test-123",
          id: "cl-test-123",
          userId: TEST_USER_ID,
        }),
        mockContext,
        mockCallback
      );

      expect(GetCommand).toHaveBeenCalledWith({
        TableName: expect.any(String),
        Key: { id: "cl-test-123" },
      });
    });
  });

  describe("create: PutCommand に正しいアイテム構造が渡る", () => {
    it("id・userId・createdAt・updatedAt が付与されて PutCommand に渡される", async () => {
      mockSend.mockResolvedValueOnce({});

      const input = {
        title: "特別演奏会",
        concertDate: "2024-06-15T18:30:00.000Z",
        venue: "東京文化会館",
        conductor: "小澤征爾",
      };

      await createHandler(
        makeEvent({
          method: "POST",
          path: "/concert-logs",
          body: JSON.stringify(input),
          userId: TEST_USER_ID,
        }),
        mockContext,
        mockCallback
      );

      expect(PutCommand).toHaveBeenCalledWith({
        TableName: expect.any(String),
        Item: expect.objectContaining({
          id: expect.stringMatching(/^[0-9a-f-]{36}$/),
          userId: TEST_USER_ID,
          title: "特別演奏会",
          venue: "東京文化会館",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      });
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
          path: "/concert-logs/cl-test-123",
          id: "cl-test-123",
          userId: TEST_USER_ID,
        }),
        mockContext,
        mockCallback
      );

      expect(GetCommand).toHaveBeenCalledWith({
        TableName: expect.any(String),
        Key: { id: "cl-test-123" },
      });
      expect(DeleteCommand).toHaveBeenCalledWith({
        TableName: expect.any(String),
        Key: { id: "cl-test-123" },
      });
    });
  });
});
