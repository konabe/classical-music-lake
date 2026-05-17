import type { APIGatewayProxyEvent } from "aws-lambda";
import type { ZodType } from "zod";

import { getUserId, requireAdmin } from "@/utils/auth";
import { createAdminHandler, createHandler, jsonBodyParser } from "@/utils/middleware";
import { parseRequestBody } from "@/utils/parsing";
import { getIdParam } from "@/utils/path-params";
import type { UserId } from "@/domain/value-objects/ids";

type IdFactory<TId> = (value: string) => TId;

type WithHandlerContext<TBody, TId> = {
  event: APIGatewayProxyEvent;
  body: TBody;
  id: TId;
  userId: UserId;
};

type Response = { statusCode: number; body: unknown };

type SchemaOption<TBody> = ZodType<TBody> | undefined;
type IdOption<TId> = IdFactory<TId> | undefined;

/**
 * ハンドラ共通の前処理（パスパラメータ取得・ボディパース・認証情報取得・admin チェック）を
 * 宣言的に組み立てる薄いラッパー。各オプションを省略すると対応する処理を実行しない。
 *
 * - `idFrom`: `event.pathParameters.id` を VO 化して `ctx.id` に渡す
 * - `schema`: `parseRequestBody(event.body, schema)` の結果を `ctx.body` に渡す（jsonBodyParser を自動装着）
 * - `userId: true`: `getUserId(event)` を `ctx.userId` に渡す
 * - `admin: true`: `createAdminHandler` 経由でラップし、Lambda 内 `requireAdmin` も明示呼び出し
 *
 * 既存の `createHandler` / `createAdminHandler` をベースにしており、CORS / エラーハンドリング /
 * レスポンスシリアライズはそのまま再利用する。
 */
export const withHandler = <TBody = undefined, TId = undefined>(options: {
  admin?: boolean;
  userId?: boolean;
  schema?: SchemaOption<TBody>;
  idFrom?: IdOption<TId>;
  handler: (ctx: WithHandlerContext<TBody, TId>) => Promise<Response>;
}) => {
  const core = async (event: APIGatewayProxyEvent): Promise<Response> => {
    if (options.admin === true) {
      requireAdmin(event);
    }
    const id =
      options.idFrom !== undefined
        ? getIdParam(event, options.idFrom)
        : (undefined as unknown as TId);
    const body =
      options.schema !== undefined
        ? parseRequestBody(event.body, options.schema)
        : (undefined as unknown as TBody);
    const userId = options.userId === true ? getUserId(event) : (undefined as unknown as UserId);
    return options.handler({ event, body, id, userId });
  };

  const base = options.admin === true ? createAdminHandler(core) : createHandler(core);
  return options.schema !== undefined ? base.use(jsonBodyParser) : base;
};
