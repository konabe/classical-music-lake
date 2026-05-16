import { createHandler } from "@/utils/middleware";
import { getIdParam } from "@/utils/path-params";
import { ok } from "@/utils/response";
import { createMovementUsecase, PieceId } from "@/usecases/piece-usecase";

const usecase = createMovementUsecase();

/**
 * GET /pieces/{id}/children
 *
 * 親 Work 配下の Movement を `index` 昇順で全件返す。
 * 認証不要（参照系の他エンドポイント `GET /pieces` / `GET /pieces/{id}` と同じ）。
 *
 * Movement のレスポンスには `composerId` は含まれない（親 Work から継承）。
 * 親が存在しない場合は空配列を返す（GSI Query は親 Work の存在を要求しない）。
 */
export const handler = createHandler(async (event) => {
  const id = getIdParam(event, PieceId.from);
  const movements = await usecase.listChildren(id);
  return ok(movements);
});
