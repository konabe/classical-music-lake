import { COMPOSERS_PAGE_SIZE_DEFAULT } from "~/types";
import type { Composer, CreateComposerInput, UpdateComposerInput } from "~/types";
import { useAuthenticatedApi } from "./useAuthenticatedApi";

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

/**
 * 作曲家マスタ一覧の無限スクロール / カーソル型ページング用 composable。
 */
export const useComposersPaginated = () => {
  const apiBase = useApiBase();
  const { authenticatedFetch, throwResponseError, parseJsonResponse } = useAuthenticatedApi();

  const postComposer = async (input: CreateComposerInput): Promise<Composer> => {
    const response = await authenticatedFetch(`${apiBase}/composers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      return throwResponseError(response);
    }
    return parseJsonResponse<Composer>(response);
  };

  const putComposer = async (id: string, input: UpdateComposerInput): Promise<Composer> => {
    const response = await authenticatedFetch(`${apiBase}/composers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      return throwResponseError(response);
    }
    return parseJsonResponse<Composer>(response);
  };

  const deleteComposerRequest = async (id: string): Promise<void> => {
    const response = await authenticatedFetch(`${apiBase}/composers/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      return throwResponseError(response);
    }
  };

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
    const result = await postComposer(input);
    reset();
    return result;
  };

  const updateComposer = async (id: string, input: UpdateComposerInput) => {
    const result = await putComposer(id, input);
    reset();
    return result;
  };

  const deleteComposer = async (id: string) => {
    await deleteComposerRequest(id);
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
  return useFetch<Composer>(() => `${apiBase}/composers/${id()}`);
};
