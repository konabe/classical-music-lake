import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { updatePieceSchema } from "../../utils/schemas";
import { getIdParam } from "../../utils/path-params";
import { ok } from "../../utils/response";
import { updatePiece } from "../../usecases/piece/update-piece";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const input = parseRequestBody(event.body as unknown, updatePieceSchema);
  const piece = await updatePiece(id, input);
  return ok(piece);
}).use(jsonBodyParser);
