import { COMPOSERS_PAGE_SIZE_DEFAULT, COMPOSERS_PAGE_SIZE_MAX } from "~/types";
import type { Composer, CreateComposerInput, UpdateComposerInput } from "~/types";
import { useAuthenticatedApi } from "./useAuthenticatedApi";
import { usePaginatedList, type PageResult } from "./usePaginatedList";

const fetchPage = async (
  apiBase: string,
  options: { limit: number; cursor?: string }
): Promise<PageResult<Composer>> => {
  const query: { limit: number; cursor?: string } = { limit: options.limit };
  if (options.cursor !== undefined) {
    query.cursor = options.cursor;
  }
  return $fetch<PageResult<Composer>>(`${apiBase}/composers`, { query });
};

/**
 * 作曲家マスタ一覧の無限スクロール / カーソル型ページング用 composable。
 */
export const useComposersPaginated = () => {
  const apiBase = useApiBase();
  const { postJson, putJson, deleteResource } = useAuthenticatedApi();

  const postComposer = (input: CreateComposerInput): Promise<Composer> =>
    postJson<Composer>(`${apiBase}/composers`, input);

  const putComposer = (id: string, input: UpdateComposerInput): Promise<Composer> =>
    putJson<Composer>(`${apiBase}/composers/${id}`, input);

  const pagination = usePaginatedList<Composer>((cursor) =>
    fetchPage(apiBase, { limit: COMPOSERS_PAGE_SIZE_DEFAULT, cursor })
  );

  const createComposer = async (input: CreateComposerInput) => {
    const result = await postComposer(input);
    pagination.reset();
    return result;
  };

  const updateComposer = async (id: string, input: UpdateComposerInput) => {
    const result = await putComposer(id, input);
    pagination.reset();
    return result;
  };

  const deleteComposer = async (id: string) => {
    await deleteResource(`${apiBase}/composers/${id}`);
    pagination.reset();
  };

  return { ...pagination, createComposer, updateComposer, deleteComposer };
};

export const useComposer = (id: () => string) => {
  const apiBase = useApiBase();
  return useFetch<Composer>(() => `${apiBase}/composers/${id()}`);
};

/**
 * 作曲家マスタを 1 回の Scan（limit={@link COMPOSERS_PAGE_SIZE_MAX}）で取得するヘルパー。
 * Composer は数十件規模の小さいマスタであることを前提とし、ページングは行わない。
 * 1 ページに収まらなかった場合（`nextCursor !== null`）は想定を超えたデータ量としてエラーを投げ、
 * 呼び出し元に検索 UI への切り替えを促す。
 */
export const useComposersAll = () => {
  const apiBase = useApiBase();
  const data = ref<Composer[] | null>(null);
  const pending = ref<boolean>(false);
  const error = ref<Error | null>(null);

  const refresh = async () => {
    pending.value = true;
    error.value = null;
    try {
      const res = await fetchPage(apiBase, { limit: COMPOSERS_PAGE_SIZE_MAX });
      if (res.nextCursor !== null) {
        throw new Error(
          `useComposersAll: composers exceed single-scan limit (${COMPOSERS_PAGE_SIZE_MAX}). Switch to paginated/search UI.`
        );
      }
      data.value = res.items;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      pending.value = false;
    }
  };

  return { data, pending, error, refresh };
};
