import { createHandler } from "../../utils/middleware";
import { ok } from "../../utils/response";
import { createPieceUsecase } from "../../usecases/piece-usecase";

const usecase = createPieceUsecase();

export const handler = createHandler(async () => {
  const pieces = await usecase.list();
  return ok(pieces);
});
