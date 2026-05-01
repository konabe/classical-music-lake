import { createHandler } from "../../utils/middleware";
import { parseListQuery } from "../../utils/parsing";
import { ok } from "../../utils/response";
import { listComposersQuerySchema } from "../../utils/schemas";
import { createComposerUsecase } from "../../usecases/composer-usecase";

const usecase = createComposerUsecase();

export const handler = createHandler(async (event) => {
  const { limit, exclusiveStartKey } = parseListQuery(
    event.queryStringParameters,
    listComposersQuerySchema,
  );
  const page = await usecase.list({ limit, exclusiveStartKey });
  return ok(page);
});
