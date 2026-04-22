import { createAdminHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { updateComposerSchema } from "../../utils/schemas";
import { getIdParam } from "../../utils/path-params";
import { ok } from "../../utils/response";
import { ComposerId, createComposerUsecase } from "../../usecases/composer-usecase";

const usecase = createComposerUsecase();

export const handler = createAdminHandler(async (event) => {
  const id = getIdParam(event, ComposerId.from);
  const input = parseRequestBody(event.body as unknown, updateComposerSchema);
  const composer = await usecase.update(id, input);
  return ok(composer);
}).use(jsonBodyParser);
