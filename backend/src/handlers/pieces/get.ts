import { createHandler } from "@/utils/middleware";
import { getIdParam } from "@/utils/path-params";
import { ok } from "@/utils/response";
import { createPieceUsecase, PieceId } from "@/usecases/piece-usecase";

const usecase = createPieceUsecase();

/**
 * GET /pieces/{id}
 *
 * kind を問わず単一ノード（Work または Movement）を返す。
 * Movement のレスポンスには `composerId` は含まれない（親 Work からの継承）。
 */
export const handler = createHandler(async (event) => {
  const id = getIdParam(event, PieceId.from);
  const piece = await usecase.getNode(id);
  return ok(piece);
});
