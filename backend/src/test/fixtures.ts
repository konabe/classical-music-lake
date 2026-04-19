import { describe, it, expect } from "vitest";
import type { Composer, ListeningLog, Piece } from "../types";
import type { APIGatewayProxyEvent, Context } from "aws-lambda";

export const makeLog = (
  id: string,
  listenedAt: string,
  userId: string | null = "user-123"
): ListeningLog => ({
  id,
  listenedAt,
  userId,
  composer: "ベートーヴェン",
  piece: "交響曲第5番 ハ短調 Op.67",
  rating: 4,
  isFavorite: false,
  memo: "カラヤン指揮、ベルリン・フィル。第1楽章の緊張感が素晴らしい。",
  createdAt: "2024-06-01T09:00:00.000Z",
  updatedAt: "2024-06-01T09:00:00.000Z",
});

export const TEST_COMPOSER_ID = "00000000-0000-4000-8000-000000000001";

export const makePiece = (id: string, title: string, composerId?: string): Piece => ({
  id,
  title,
  composerId: composerId ?? TEST_COMPOSER_ID,
  createdAt: "2024-06-01T09:00:00.000Z",
  updatedAt: "2024-06-01T09:00:00.000Z",
});

export const makeComposer = (id: string, name: string): Composer => ({
  id,
  name,
  createdAt: "2024-06-01T09:00:00.000Z",
  updatedAt: "2024-06-01T09:00:00.000Z",
});

export const makeEvent = (overrides?: Partial<APIGatewayProxyEvent>): APIGatewayProxyEvent => ({
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: "GET",
  isBase64Encoded: false,
  path: "/",
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {} as APIGatewayProxyEvent["requestContext"],
  resource: "",
  ...overrides,
});

export const makeAuthEvent = (
  userId: string,
  overrides?: Partial<APIGatewayProxyEvent>,
  groups?: string[] | string
): APIGatewayProxyEvent => {
  const claims: Record<string, unknown> = { sub: userId };
  if (groups !== undefined) {
    claims["cognito:groups"] = groups;
  }
  return {
    ...makeEvent(overrides),
    requestContext: {
      authorizer: { claims },
    } as unknown as APIGatewayProxyEvent["requestContext"],
  };
};

export const makeAdminEvent = (
  userId: string,
  overrides?: Partial<APIGatewayProxyEvent>
): APIGatewayProxyEvent => makeAuthEvent(userId, overrides, ["admin"]);

export const mockContext: Context = {} as Context;
export const mockCallback = { signal: new AbortController().signal };

export const TEST_USER_ID = "cognito-sub-user-123";
export const OTHER_USER_ID = "cognito-sub-other-user";

export const makeDeleteEvent = (
  pathPrefix: string,
  id?: string,
  userId?: string
): APIGatewayProxyEvent => ({
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: "DELETE",
  isBase64Encoded: false,
  path: `/${pathPrefix}/${id ?? ""}`,
  pathParameters: id === undefined ? null : { id },
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {
    authorizer: userId === undefined ? undefined : { claims: { sub: userId } },
  } as APIGatewayProxyEvent["requestContext"],
  resource: "",
});

type HandlerFn = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: unknown
) => Promise<{ statusCode?: number; body?: string } | null | undefined>;

export const describeInvalidBodyCases = (handler: HandlerFn, path: string) => {
  describe("リクエストボディ異常系", () => {
    it.each<[string | null, number, string]>([
      [null, 400, "Request body is required"],
      ["null", 400, "Request body is required"],
      ["[]", 400, "Request body must be a JSON object"],
      ["invalid json", 422, "Invalid or malformed JSON was provided"],
    ])("body=%j のとき %i を返す", async (body, statusCode, message) => {
      const result = await handler(
        makeEvent({ body, httpMethod: "POST", path }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(statusCode);
      expect(JSON.parse(result?.body ?? "{}").message).toBe(message);
    });
  });
};
