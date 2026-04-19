import { COMPOSERS_PAGE_SIZE_DEFAULT } from "~/types";
import type { Composer, CreateComposerInput, UpdateComposerInput } from "~/types";

/**
 * GET /composers のレスポンス形式。
 */
export type PaginatedComposersResponse = { items: Composer[]; nextCursor: string | null };

const fetchPage = async (
  apiBase: string,
  options: { limit: number; cursor?: string }
): Promise<PaginatedComposersResponse> => {
  const query: { limit: number; cursor?: string } = { limit: options.limit };
  if (options.cursor !== undefined) {
    query.cursor = options.cursor;
  }
  return $fetch<PaginatedComposersResponse>(`${apiBase}/composers`, { query });
};

const postComposer = (apiBase: string, input: CreateComposerInput): Promise<Composer> => {
  return $fetch<Composer>(`${apiBase}/composers`, { method: "POST", body: input });
};

const putComposer = (
  apiBase: string,
  id: string,
  input: UpdateComposerInput
): Promise<Composer> => {
  return $fetch<Composer>(`${apiBase}/composers/${id}`, { method: "PUT", body: input });
};

const deleteComposerRequest = (apiBase: string, id: string): Promise<void> => {
  return $fetch(`${apiBase}/composers/${id}`, { method: "DELETE" });
};

/**
 * 作曲家マスタ一覧の無限スクロール / カーソル型ページング用 composable。
 */
export const useComposersPaginated = () => {
  const apiBase = useApiBase();
  const items = ref<Composer[]>([]);
  const nextCursor = ref<string | null>(null);
  const pending = ref<boolean>(false);
  const error = ref<Error | null>(null);
  const hasMore = ref<boolean>(true);

  const loadMore = async () => {
    if (pending.value === true) {
      return;
    }
    if (hasMore.value === false) {
      return;
    }
    pending.value = true;
    error.value = null;
    try {
      const res = await fetchPage(apiBase, {
        limit: COMPOSERS_PAGE_SIZE_DEFAULT,
        cursor: nextCursor.value ?? undefined,
      });
      items.value = [...items.value, ...res.items];
      nextCursor.value = res.nextCursor;
      hasMore.value = res.nextCursor !== null;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      pending.value = false;
    }
  };

  const reset = () => {
    items.value = [];
    nextCursor.value = null;
    hasMore.value = true;
    error.value = null;
  };

  const retry = async () => {
    error.value = null;
    await loadMore();
  };

  const createComposer = async (input: CreateComposerInput) => {
    const result = await postComposer(apiBase, input);
    reset();
    return result;
  };

  const updateComposer = async (id: string, input: UpdateComposerInput) => {
    const result = await putComposer(apiBase, id, input);
    reset();
    return result;
  };

  const deleteComposer = async (id: string) => {
    await deleteComposerRequest(apiBase, id);
    reset();
  };

  return {
    items,
    nextCursor,
    pending,
    error,
    hasMore,
    loadMore,
    reset,
    retry,
    createComposer,
    updateComposer,
    deleteComposer,
  };
};

export const useComposer = (id: () => string) => {
  const apiBase = useApiBase();
  return useFetch<Composer>(() => {
    return `${apiBase}/composers/${id()}`;
  });
};
