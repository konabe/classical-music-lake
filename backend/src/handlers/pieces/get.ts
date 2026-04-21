import { createHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { ok } from "../../utils/response";
import { createPieceUsecase, PieceId } from "../../usecases/piece-usecase";

const usecase = createPieceUsecase();

export const handler = createHandler(async (event) => {
  const id = getIdParam(event, PieceId.from);
  const piece = await usecase.get(id);
  return ok(piece);
});
