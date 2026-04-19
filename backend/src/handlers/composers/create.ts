import { requireAdmin } from "../../utils/auth";
import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { createComposerSchema } from "../../utils/schemas";
import { created } from "../../utils/response";
import { createComposerUsecase } from "../../usecases/composer-usecase";

const usecase = createComposerUsecase();

export const handler = createHandler(async (event) => {
  requireAdmin(event);
  const input = parseRequestBody(event.body as unknown, createComposerSchema);
  const composer = await usecase.create(input);
  return created(composer);
}).use(jsonBodyParser);
