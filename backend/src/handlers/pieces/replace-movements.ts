import { withHandler } from "@/utils/handler";
import { ok } from "@/utils/response";
import { replaceMovementsSchema } from "@/utils/schemas";
import { createMovementUsecase, PieceId } from "@/usecases/piece-usecase";

const usecase = createMovementUsecase();

/**
 * PUT /pieces/{workId}/movements
 *
 * 親 Work 配下の Movement 集合を一括差し替えする（admin 必須）。
 * 並び替え・追加・削除を 1 つの DynamoDB TransactWriteItems で原子的に反映する。
 *
 * - リクエストボディ: `{ movements: [{ id?, index, title, videoUrls? }, ...] }`
 *   - `id` を指定すると既存 Movement の更新（`createdAt` を引き継ぐ）。省略時は新規採番。
 *   - 同じ Work 内で `index` の重複は 400 で拒否される（`replaceMovementsSchema` の `.refine`）。
 * - 楽観的ロック: Work の `updatedAt` を ifMatch にして同一トランザクションに含める。
 *   競合時は 409 Conflict を返す。
 * - 上限: `MOVEMENTS_PER_WORK_MAX = 49` 件まで。
 */
export const handler = withHandler({
  admin: true,
  idFrom: PieceId.from,
  schema: replaceMovementsSchema,
  handler: async ({ id, body }) => {
    const movements = await usecase.replaceAll(id, body.movements);
    return ok({ movements });
  },
});
