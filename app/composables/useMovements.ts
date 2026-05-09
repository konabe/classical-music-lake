import type { PieceMovement } from "~/types";
import { useAuthenticatedApi } from "./useAuthenticatedApi";

/**
 * 親 Work 配下の楽章一覧を取得する composable。
 *
 * バックエンドの `GET /pieces/{id}/children` は `index` 昇順で全件返す。
 * 認証不要（参照系）。Movement のレスポンスには `composerId` は含まれない（親 Work から継承）。
 */
export const useMovements = (workId: () => string) => {
  const apiBase = useApiBase();
  return useFetch<PieceMovement[]>(() => `${apiBase}/pieces/${workId()}/children`);
};

/**
 * 親 Work 配下の楽章集合を一括差し替えする composable。
 *
 * バックエンドの `PUT /pieces/{workId}/movements` を呼び出す。admin 必須。
 * 並び替え・追加・削除を 1 つのトランザクションで原子的に反映する。
 */
export const useReplaceMovements = () => {
  const apiBase = useApiBase();
  const { putJson } = useAuthenticatedApi();

  type ReplaceMovementsItem = {
    id?: string;
    index: number;
    title: string;
    videoUrls?: string[];
  };

  const replaceMovements = async (
    workId: string,
    items: ReplaceMovementsItem[],
  ): Promise<PieceMovement[]> => {
    const response = await putJson<{ movements: PieceMovement[] }>(
      `${apiBase}/pieces/${workId}/movements`,
      { movements: items },
    );
    return response.movements;
  };

  return { replaceMovements };
};
