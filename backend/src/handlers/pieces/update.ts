import { requireAdmin } from "../../utils/auth";
import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { updatePieceSchema } from "../../utils/schemas";
import { getIdParam } from "../../utils/path-params";
import { ok } from "../../utils/response";
import { createPieceUsecase } from "../../usecases/piece-usecase";

const usecase = createPieceUsecase();

export const handler = createHandler(async (event) => {
  requireAdmin(event);
  const id = getIdParam(event);
  const input = parseRequestBody(event.body as unknown, updatePieceSchema);
  const piece = await usecase.update(id, input);
  return ok(piece);
}).use(jsonBodyParser);
