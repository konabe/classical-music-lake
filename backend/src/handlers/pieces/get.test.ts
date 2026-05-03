import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import type { Piece, PieceWork } from "../../types";

import { handler } from "./get";

const mockRepo = vi.hoisted(() => ({
  saveWork: vi.fn(),
  saveWorkWithOptimisticLock: vi.fn(),
  removeWorkCascade: vi.fn(),
  findRootById: vi.fn(),
  findRootPage: vi.fn(),
  findById: vi.fn(),
  findChildren: vi.fn(),
  saveMovement: vi.fn(),
  saveMovementWithOptimisticLock: vi.fn(),
  removeMovement: vi.fn(),
  replaceMovements: vi.fn(),
}));

vi.mock("../../repositories/piece-repository", () => ({
  DynamoDBPieceRepository: vi.fn().mockImplementation(function () {
    return mockRepo;
  }),
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

function makeEvent(id?: string): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "GET",
    isBase64Encoded: false,
    path: `/pieces/${id ?? ""}`,
    pathParameters: id === undefined ? null : { id },
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };
}

const testPiece: PieceWork = {
  kind: "work",
  id: "abc-123",
  title: "交響曲第9番",
  composerId: "00000000-0000-4000-8000-000000000001",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("GET /pieces/{id} (get)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(makeEvent(), mockContext, mockCallback);
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    mockRepo.findRootById.mockResolvedValueOnce(undefined);
    const result = await handler(makeEvent("not-found-id"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(404);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("Piece not found");
  });

  it("正常に取得して 200 を返す", async () => {
    mockRepo.findRootById.mockResolvedValueOnce(testPiece);
    const result = await handler(makeEvent("abc-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}") as Piece;
    expect(body.kind).toBe("work");
    expect(body.id).toBe("abc-123");
    expect(body.title).toBe("交響曲第9番");
    expect((body as PieceWork).composerId).toBe("00000000-0000-4000-8000-000000000001");
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockRepo.findRootById.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeEvent("abc-123"), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
