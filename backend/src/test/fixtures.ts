import type { ListeningLog, Piece } from "../types";
import type { APIGatewayProxyEvent } from "aws-lambda";

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

export const makePiece = (id: string, title: string): Piece => ({
  id,
  title,
  composer: "モーツァルト",
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
  overrides?: Partial<APIGatewayProxyEvent>
): APIGatewayProxyEvent => ({
  ...makeEvent(overrides),
  requestContext: {
    authorizer: {
      claims: { sub: userId },
    },
  } as unknown as APIGatewayProxyEvent["requestContext"],
});
