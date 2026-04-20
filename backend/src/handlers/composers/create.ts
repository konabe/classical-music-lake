import { createAdminHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { createComposerSchema } from "../../utils/schemas";
import { created } from "../../utils/response";
import { createComposerUsecase } from "../../usecases/composer-usecase";

const usecase = createComposerUsecase();

export const handler = createAdminHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, createComposerSchema);
  const composer = await usecase.create(input);
  return created(composer);
}).use(jsonBodyParser);
