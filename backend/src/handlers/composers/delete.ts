import { withHandler } from "../../utils/handler";
import { noContent } from "../../utils/response";
import { ComposerId, createComposerUsecase } from "../../usecases/composer-usecase";

const usecase = createComposerUsecase();

export const handler = withHandler({
  admin: true,
  idFrom: ComposerId.from,
  handler: async ({ id }) => {
    await usecase.delete(id);
    return noContent();
  },
});
