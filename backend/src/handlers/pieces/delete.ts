import { withHandler } from "@/utils/handler";
import { noContent } from "@/utils/response";
import { createPieceUsecase, PieceId } from "@/usecases/piece-usecase";

const usecase = createPieceUsecase();

export const handler = withHandler({
  admin: true,
  idFrom: PieceId.from,
  handler: async ({ id }) => {
    await usecase.delete(id);
    return noContent();
  },
});
