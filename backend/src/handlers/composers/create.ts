import { withHandler } from "@/utils/handler";
import { createComposerSchema } from "@/utils/schemas";
import { created } from "@/utils/response";
import { createComposerUsecase } from "@/usecases/composer-usecase";

const usecase = createComposerUsecase();

export const handler = withHandler({
  admin: true,
  schema: createComposerSchema,
  handler: async ({ body }) => created(await usecase.create(body)),
});
