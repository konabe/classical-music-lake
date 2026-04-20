import { createAdminHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { noContent } from "../../utils/response";
import { createComposerUsecase } from "../../usecases/composer-usecase";

const usecase = createComposerUsecase();

export const handler = createAdminHandler(async (event) => {
  const id = getIdParam(event);
  await usecase.delete(id);
  return noContent();
});
