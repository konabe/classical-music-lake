import { withHandler } from "@/utils/handler";
import { ok } from "@/utils/response";
import { createPieceUsecase, PieceId } from "@/usecases/piece-usecase";

const usecase = createPieceUsecase();

/**
 * GET /pieces/{id}
 *
 * kind を問わず単一ノード（Work または Movement）を返す。
 * Movement のレスポンスには `composerId` は含まれない（親 Work からの継承）。
 */
export const handler = withHandler({
  idFrom: PieceId.from,
  handler: async ({ id }) => {
    const piece = await usecase.getNode(id);
    return ok(piece);
  },
});
