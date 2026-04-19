import { requireAdmin } from "../../utils/auth";
import { createHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { noContent } from "../../utils/response";
import { createComposerUsecase } from "../../usecases/composer-usecase";

const usecase = createComposerUsecase();

export const handler = createHandler(async (event) => {
  requireAdmin(event);
  const id = getIdParam(event);
  await usecase.delete(id);
  return noContent();
});
