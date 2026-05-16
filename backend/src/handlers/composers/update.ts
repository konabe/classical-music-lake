import { withHandler } from "@/utils/handler";
import { updateComposerSchema } from "@/utils/schemas";
import { ok } from "@/utils/response";
import { ComposerId, createComposerUsecase } from "@/usecases/composer-usecase";

const usecase = createComposerUsecase();

export const handler = withHandler({
  admin: true,
  idFrom: ComposerId.from,
  schema: updateComposerSchema,
  handler: async ({ id, body }) => ok(await usecase.update(id, body)),
});
