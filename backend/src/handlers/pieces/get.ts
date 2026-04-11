import { createHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { ok } from "../../utils/response";
import { createPieceUsecase } from "../../usecases/piece-usecase";

const usecase = createPieceUsecase();

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const piece = await usecase.get(id);
  return ok(piece);
});
