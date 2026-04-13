import createError from "http-errors";

import { decodeCursor, InvalidCursorError } from "../../utils/cursor";
import { createHandler } from "../../utils/middleware";
import { ok } from "../../utils/response";
import { listPiecesQuerySchema } from "../../utils/schemas";
import { createPieceUsecase } from "../../usecases/piece-usecase";

const usecase = createPieceUsecase();

export const handler = createHandler(async (event) => {
  const parsed = listPiecesQuerySchema.safeParse(event.queryStringParameters ?? {});
  if (!parsed.success) {
    throw new createError.BadRequest(parsed.error.issues[0]?.message ?? "Invalid query parameter");
  }
  const { limit, cursor } = parsed.data;

  let exclusiveStartKey: Record<string, unknown> | undefined;
  if (cursor !== undefined) {
    try {
      exclusiveStartKey = decodeCursor(cursor);
    } catch (err) {
      if (err instanceof InvalidCursorError) {
        throw new createError.BadRequest(err.message);
      }
      throw err;
    }
  }

  const page = await usecase.list({ limit, exclusiveStartKey });
  return ok(page);
});
