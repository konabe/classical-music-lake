/**
 * 汎用のカーソル型ページング state machine。
 * `items / nextCursor / pending / error / hasMore` をリアクティブに公開し、
 * `loadMore / reset / retry` を提供する。個別リソース側は `fetchPage` のみ実装すれば良い。
 */
export type PageResult<T> = { items: T[]; nextCursor: string | null };

/**
 * カーソル型ページング API（`{ items, nextCursor }` 形式）を呼び出す共通ヘルパー。
 * `cursor` が `undefined` のときはクエリに含めない（初回リクエスト用）。
 */
export const fetchCursorPage = <T>(
  url: string,
  options: { limit: number; cursor?: string },
): Promise<PageResult<T>> => {
  const query: { limit: number; cursor?: string } = { limit: options.limit };
  if (options.cursor !== undefined) {
    query.cursor = options.cursor;
  }
  return $fetch<PageResult<T>>(url, { query });
};

export const usePaginatedList = <T>(fetchPage: (cursor?: string) => Promise<PageResult<T>>) => {
  const items = ref<T[]>([]);
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
      const res = await fetchPage(nextCursor.value ?? undefined);
      items.value = [...items.value, ...res.items] as typeof items.value;
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

  return { items, nextCursor, pending, error, hasMore, loadMore, reset, retry };
};
