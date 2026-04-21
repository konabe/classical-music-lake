import { createAdminHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { noContent } from "../../utils/response";
import { ComposerId, createComposerUsecase } from "../../usecases/composer-usecase";

const usecase = createComposerUsecase();

export const handler = createAdminHandler(async (event) => {
  const id = getIdParam(event, ComposerId.from);
  await usecase.delete(id);
  return noContent();
});
