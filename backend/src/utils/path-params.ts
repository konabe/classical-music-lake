import createError from "http-errors";
import type { APIGatewayProxyEvent } from "aws-lambda";

/**
 * パスパラメータ `id` を取得し、呼び出し側が指定する値オブジェクトに変換する。
 *
 * 例: `getIdParam(event, ListeningLogId.from)` で `ListeningLogId` が得られる。
 * これにより、エンティティごとに誤った ID 型（例: `PieceId` と `ComposerId` の取り違え）
 * を usecase に渡すことを TypeScript の型検査で防ぐ。
 */
export const getIdParam = <T>(event: APIGatewayProxyEvent, factory: (value: string) => T): T => {
  const id = event.pathParameters?.id;
  if (id === undefined || id === "") {
    throw new createError.BadRequest("id is required");
  }
  return factory(id);
};
