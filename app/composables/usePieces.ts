import {
  PIECES_ALL_MAX_EMPTY_PAGES,
  PIECES_ALL_MAX_TOTAL,
  PIECES_PAGE_SIZE_DEFAULT,
} from "~/types";
import type { CreatePieceInput, Piece, UpdatePieceInput } from "~/types";
import { useAuthenticatedApi } from "./useAuthenticatedApi";
import { fetchCursorPage, usePaginatedList } from "./usePaginatedList";

const fetchPiecesPage = (apiBase: string, options: { limit: number; cursor?: string }) =>
  fetchCursorPage<Piece>(`${apiBase}/pieces`, options);

const usePieceMutations = () => {
  const apiBase = useApiBase();
  const { postJson, putJson } = useAuthenticatedApi();

  const postPiece = (input: CreatePieceInput): Promise<Piece> =>
    postJson<Piece>(`${apiBase}/pieces`, input);

  const putPiece = (id: string, input: UpdatePieceInput): Promise<Piece> =>
    putJson<Piece>(`${apiBase}/pieces/${id}`, input);

  return { postPiece, putPiece };
};

/**
 * 楽曲マスタ一覧の無限スクロール / カーソル型ページング用 composable。
 * - items / nextCursor / pending / error / hasMore をリアクティブに公開
 * - loadMore() で 1 ページ進める。pending 中 / hasMore=false では no-op
 * - reset() / retry() で状態を初期化・再試行
 * - createPiece / updatePiece は成功時に reset() して一覧を再取得できる状態にする
 */
export const usePiecesPaginated = () => {
  const apiBase = useApiBase();
  const { postPiece, putPiece } = usePieceMutations();
  const pagination = usePaginatedList<Piece>((cursor) =>
    fetchPiecesPage(apiBase, { limit: PIECES_PAGE_SIZE_DEFAULT, cursor }),
  );

  const createPiece = async (input: CreatePieceInput) => {
    const result = await postPiece(input);
    pagination.reset();
    return result;
  };

  const updatePiece = async (id: string, input: UpdatePieceInput) => {
    const result = await putPiece(id, input);
    pagination.reset();
    return result;
  };

  return { ...pagination, createPiece, updatePiece };
};

/**
 * 楽曲マスタの全件集約ヘルパー。
 *
 * @deprecated 新規コードでは {@link usePiecesPaginated} を使い、検索・絞り込み前提の UI
 * に作り替えること。本関数は `/concert-logs/new` の楽曲選択ドロップダウン等で
 * 既存画面が「全件を前提とする」ために残置した暫定ヘルパーで、呼び出し元の UI 改修完了後に削除予定。
 *
 * 内部で nextCursor を辿って全件を集約する。暴走防止のため以下のハードガードを持つ:
 * - 総件数 {@link PIECES_ALL_MAX_TOTAL} を超えたらエラー
 * - 連続空ページ応答が {@link PIECES_ALL_MAX_EMPTY_PAGES} 回を超えたらエラー
 */
export const usePiecesAll = () => {
  const apiBase = useApiBase();
  const { postPiece, putPiece } = usePieceMutations();
  const data = ref<Piece[] | null>(null);
  const pending = ref<boolean>(false);
  const error = ref<Error | null>(null);

  const refresh = async () => {
    pending.value = true;
    error.value = null;
    const acc: Piece[] = [];
    let cursor: string | undefined;
    let consecutiveEmpty = 0;
    try {
      while (true) {
        const res = await fetchPiecesPage(apiBase, { limit: PIECES_PAGE_SIZE_DEFAULT, cursor });
        acc.push(...res.items);
        if (acc.length > PIECES_ALL_MAX_TOTAL) {
          throw new Error(`usePiecesAll: exceeded maximum total items (${PIECES_ALL_MAX_TOTAL})`);
        }
        if (res.items.length === 0) {
          consecutiveEmpty += 1;
          if (consecutiveEmpty > PIECES_ALL_MAX_EMPTY_PAGES) {
            throw new Error(
              `usePiecesAll: exceeded consecutive empty pages (${PIECES_ALL_MAX_EMPTY_PAGES})`,
            );
          }
        } else {
          consecutiveEmpty = 0;
        }
        if (res.nextCursor === null) {
          break;
        }
        cursor = res.nextCursor;
      }
      data.value = acc;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      pending.value = false;
    }
  };

  const createPiece = async (input: CreatePieceInput) => {
    const result = await postPiece(input);
    await refresh();
    return result;
  };

  const updatePiece = async (id: string, input: UpdatePieceInput) => {
    const result = await putPiece(id, input);
    await refresh();
    return result;
  };

  return { data, pending, error, refresh, createPiece, updatePiece };
};

export const usePiece = (id: () => string) => {
  const apiBase = useApiBase();
  return useFetch<Piece>(() => `${apiBase}/pieces/${id()}`);
};
