import middy from "@middy/core";
import httpCors from "@middy/http-cors";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpResponseSerializer from "@middy/http-response-serializer";
import type { HttpError } from "http-errors";
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

import { env } from "./env";

export type LambdaHandler = (
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
 * リクエストボディを JSON としてパースする middy ミドルウェア。
 * Content-Type チェックを無効化し、不正な JSON の場合は 422 を返す。
 * ボディが必要なハンドラー（create / update）に個別適用すること。
 */
export const jsonBodyParser = httpJsonBodyParser({ disableContentTypeCheck: true });

/**
 * Lambda ハンドラーに共通ミドルウェアを適用する。
 * - @middy/http-cors: CORS ヘッダーを自動付与
 * - httpErrorMiddleware: throw された http-errors を { message } JSON に変換
 * - @middy/http-response-serializer: 正常レスポンスのボディを JSON シリアライズ
 */
export const createHandler = (handler: LambdaHandler) =>
  middy<APIGatewayProxyEvent, APIGatewayProxyResult>()
    // LambdaHandler returns `body: unknown` while APIGatewayProxyResult expects
    // `body: string`. The cast is safe because httpResponseSerializer will
    // JSON.stringify the body at runtime before the response is returned.
    .handler(handler as middy.Handler<APIGatewayProxyEvent, APIGatewayProxyResult>)
    .use(
      httpCors({
        origin: env.corsAllowOrigin,
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
            serializer: (response) => {
              const { body } = response as { body: unknown };
              return body === "" ? "" : JSON.stringify(body);
            },
          },
        ],
        defaultContentType: "application/json",
      })
    );
