import { COMPOSERS_PAGE_SIZE_MAX } from "~/types";
import type { Composer, CreateComposerInput, UpdateComposerInput } from "~/types";
import { useAuthenticatedApi } from "./useAuthenticatedApi";
import { fetchCursorPage } from "./usePaginatedList";

const fetchComposersPage = (apiBase: string, options: { limit: number; cursor?: string }) =>
  fetchCursorPage<Composer>(`${apiBase}/composers`, options);

/**
 * 作曲家マスタを 1 回の Scan（limit={@link COMPOSERS_PAGE_SIZE_MAX}）で取得する composable。
 * Composer は数十件規模の小さいマスタ前提でページングは行わない。
 * 1 ページに収まらなかった場合（`nextCursor !== null`）は想定を超えたデータ量としてエラーを投げ、
 * 呼び出し元に検索 UI への切り替えを促す。
 *
 * 書き込み系（`createComposer` / `updateComposer` / `deleteComposer`）も併設し、
 * 成功時は内部で `refresh()` をトリガーする。
 */
export const useComposersAll = () => {
  const apiBase = useApiBase();
  const { postJson, putJson, deleteResource } = useAuthenticatedApi();
  const data = ref<Composer[] | null>(null);
  const pending = ref<boolean>(false);
  const error = ref<Error | null>(null);

  const refresh = async () => {
    pending.value = true;
    error.value = null;
    try {
      const res = await fetchComposersPage(apiBase, { limit: COMPOSERS_PAGE_SIZE_MAX });
      if (res.nextCursor !== null) {
        throw new Error(
          `useComposersAll: composers exceed single-scan limit (${COMPOSERS_PAGE_SIZE_MAX}). Switch to paginated/search UI.`,
        );
      }
      data.value = res.items;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      pending.value = false;
    }
  };

  const createComposer = async (input: CreateComposerInput): Promise<Composer> => {
    const result = await postJson<Composer>(`${apiBase}/composers`, input);
    await refresh();
    return result;
  };

  const updateComposer = async (id: string, input: UpdateComposerInput): Promise<Composer> => {
    const result = await putJson<Composer>(`${apiBase}/composers/${id}`, input);
    await refresh();
    return result;
  };

  const deleteComposer = async (id: string): Promise<void> => {
    await deleteResource(`${apiBase}/composers/${id}`);
    await refresh();
  };

  return { data, pending, error, refresh, createComposer, updateComposer, deleteComposer };
};

export const useComposer = (id: () => string) => {
  const apiBase = useApiBase();
  return useFetch<Composer>(() => `${apiBase}/composers/${id()}`);
};
