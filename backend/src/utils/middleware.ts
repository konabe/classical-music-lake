import middy from "@middy/core";
import httpCors from "@middy/http-cors";
import httpResponseSerializer from "@middy/http-response-serializer";
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

type Handler = (
  event: APIGatewayProxyEvent,
  context: Context
) => Promise<{ statusCode: number; body: unknown }>;

/**
 * Lambda ハンドラーに共通ミドルウェアを適用する。
 * - @middy/http-cors: CORS ヘッダーを自動付与
 * - @middy/http-response-serializer: レスポンスボディを JSON シリアライズ
 */
export const createHandler = (handler: Handler) =>
  middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
    .handler(handler as Parameters<typeof middy>[0])
    .use(
      httpCors({
        origin: process.env.CORS_ALLOW_ORIGIN ?? "*",
        headers: "Content-Type",
        methods: "GET,POST,PUT,DELETE,OPTIONS",
      })
    )
    .use(
      httpResponseSerializer({
        serializers: [
          {
            regex: /^application\/json$/,
            serializer: ({ body }) => (body === "" ? "" : JSON.stringify(body)),
          },
        ],
        defaultContentType: "application/json",
      })
    );
