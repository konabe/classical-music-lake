import type { ListeningLog, Piece } from "../types";
import type { APIGatewayProxyEvent } from "aws-lambda";

export const makeLog = (id: string, listenedAt: string): ListeningLog => ({
  id,
  listenedAt,
  composer: "作曲家",
  piece: "曲名",
  rating: 3,
  isFavorite: false,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
});

export const makePiece = (id: string, title: string): Piece => ({
  id,
  title,
  composer: "作曲家",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
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
