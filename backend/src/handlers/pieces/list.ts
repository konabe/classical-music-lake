import { createHandler } from "../../utils/middleware";
import { ok } from "../../utils/response";
import { listPieces } from "../../usecases/piece/list-pieces";

export const handler = createHandler(async () => {
  const pieces = await listPieces();
  return ok(pieces);
});
