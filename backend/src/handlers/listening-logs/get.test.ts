import type { APIGatewayProxyEvent, Context } from "aws-lambda";

import { handler } from "@/handlers/listening-logs/get";
import { makeComposer, makeLogRecord, makePiece } from "@/test/fixtures";
import { mockComposerRepo } from "@/repositories/__mocks__/composer-repository";
import { mockListeningLogRepo } from "@/repositories/__mocks__/listening-log-repository";
import { mockPieceRepo } from "@/repositories/__mocks__/piece-repository";

vi.mock("@/repositories/composer-repository");
vi.mock("@/repositories/listening-log-repository");
vi.mock("@/repositories/piece-repository");

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

const TEST_USER_ID = "cognito-sub-user-123";
const OTHER_USER_ID = "cognito-sub-other-user";

function makeEvent(id?: string, userId?: string): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "GET",
    isBase64Encoded: false,
    path: `/listening-logs/${id ?? ""}`,
    pathParameters: id === undefined ? null : { id },
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      authorizer: userId === undefined ? undefined : { claims: { sub: userId } },
    } as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };
}

describe("GET /listening-logs/:id (get)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPieceRepo.findById.mockResolvedValue(makePiece());
    mockComposerRepo.findById.mockResolvedValue(makeComposer());
  });

  it("id がない場合は 400 を返す", async () => {
    const result = await handler(makeEvent(), mockContext, mockCallback);
    expect(result?.statusCode).toBe(400);
    expect(JSON.parse(result?.body ?? "{}").message).toBe("id is required");
  });

  it("アイテムが存在しない場合は 404 を返す", async () => {
    mockListeningLogRepo.findById.mockResolvedValueOnce(undefined);
    const result = await handler(
      makeEvent("not-found-id", TEST_USER_ID),
      mockContext,
      mockCallback,
    );
    expect(result?.statusCode).toBe(404);
  });

  it("他ユーザーのアイテムにアクセスした場合は 404 を返す（存在を隠蔽）", async () => {
    mockListeningLogRepo.findById.mockResolvedValueOnce(
      makeLogRecord("abc-123", "2024-01-15T20:00:00.000Z", TEST_USER_ID),
    );
    const result = await handler(makeEvent("abc-123", OTHER_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(404);
  });

  it("正常取得して 200 を返す（派生値 pieceTitle / composerName を含む）", async () => {
    mockListeningLogRepo.findById.mockResolvedValueOnce(
      makeLogRecord("abc-123", "2024-01-15T20:00:00.000Z", TEST_USER_ID),
    );
    const result = await handler(makeEvent("abc-123", TEST_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(200);

    const body = JSON.parse(result?.body ?? "{}");
    expect(body.id).toBe("abc-123");
    expect(body.pieceTitle).toBe("交響曲第5番 ハ短調 Op.67");
    expect(body.composerName).toBe("ベートーヴェン");
  });

  it("Repository エラー時に 500 を返す", async () => {
    mockListeningLogRepo.findById.mockRejectedValueOnce(new Error("DynamoDB error"));
    const result = await handler(makeEvent("abc-123", TEST_USER_ID), mockContext, mockCallback);
    expect(result?.statusCode).toBe(500);
  });
});
