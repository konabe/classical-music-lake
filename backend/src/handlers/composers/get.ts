import { withHandler } from "../../utils/handler";
import { ok } from "../../utils/response";
import { ComposerId, createComposerUsecase } from "../../usecases/composer-usecase";

const usecase = createComposerUsecase();

export const handler = withHandler({
  idFrom: ComposerId.from,
  handler: async ({ id }) => ok(await usecase.get(id)),
});
