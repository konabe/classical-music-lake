import { requireAdmin } from "../../utils/auth";
import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { updateComposerSchema } from "../../utils/schemas";
import { getIdParam } from "../../utils/path-params";
import { ok } from "../../utils/response";
import { createComposerUsecase } from "../../usecases/composer-usecase";

const usecase = createComposerUsecase();

export const handler = createHandler(async (event) => {
  requireAdmin(event);
  const id = getIdParam(event);
  const input = parseRequestBody(event.body as unknown, updateComposerSchema);
  const composer = await usecase.update(id, input);
  return ok(composer);
}).use(jsonBodyParser);
