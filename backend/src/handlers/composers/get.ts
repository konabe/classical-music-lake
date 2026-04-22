import { createHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { ok } from "../../utils/response";
import { ComposerId, createComposerUsecase } from "../../usecases/composer-usecase";

const usecase = createComposerUsecase();

export const handler = createHandler(async (event) => {
  const id = getIdParam(event, ComposerId.from);
  const composer = await usecase.get(id);
  return ok(composer);
});
