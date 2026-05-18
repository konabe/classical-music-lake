import { withHandler } from "@/utils/handler";
import { updatePieceSchema } from "@/utils/schemas";
import { ok } from "@/utils/response";
import { createPieceUsecase, PieceId } from "@/usecases/piece-usecase";

const usecase = createPieceUsecase();

export const handler = withHandler({
  admin: true,
  idFrom: PieceId.from,
  schema: updatePieceSchema,
  handler: async ({ id, body }) => {
    const piece = await usecase.update(id, body);
    return ok(piece);
  },
});
