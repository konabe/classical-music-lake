import middy from "@middy/core";
import httpCors from "@middy/http-cors";
import httpResponseSerializer from "@middy/http-response-serializer";
import type { HttpError } from "http-errors";
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

type Handler = (
  event: APIGatewayProxyEvent,
  context: Context
) => Promise<{ statusCode: number; body: unknown }>;

/**
 * throw された http-errors を `{ message: "..." }` 形式の JSON レスポンスに変換する。
 * - 4xx: expose=true なのでエラーメッセージをそのまま返す
 * - 5xx / 予期しないエラー: 詳細を隠蔽して console.error に記録
 */
const httpErrorMiddleware = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => ({
  onError: async (request) => {
    const error = request.error as HttpError;
    const statusCode = error.statusCode ?? 500;
    const message = error.expose !== false ? error.message : "Internal server error";
    if (statusCode >= 500) console.error(error);
    request.response = {
      statusCode,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    };
  },
});

/**
 * Lambda ハンドラーに共通ミドルウェアを適用する。
 * - @middy/http-cors: CORS ヘッダーを自動付与
 * - httpErrorMiddleware: throw された http-errors を { message } JSON に変換
 * - @middy/http-response-serializer: 正常レスポンスのボディを JSON シリアライズ
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
    .use(httpErrorMiddleware())
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
