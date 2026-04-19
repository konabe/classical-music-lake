import { useAuthenticatedApi } from "./useAuthenticatedApi";

/**
 * 認証付きで単一のリソースエンドポイントに対する CRUD 操作を提供する汎用 composable。
 * `useFetch` で一覧を取得し、401 時はトークンリフレッシュを自動試行する。
 * create / update / deleteItem は成功時に `clearNuxtData()` を呼び出して SSR キャッシュを無効化する。
 */
export const useCrudResource = <TEntity, TCreateInput, TUpdateInput>(resourceName: string) => {
  const apiBase = useApiBase();
  const {
    getAuthHeaders,
    handleAuthError,
    throwResponseError,
    parseJsonResponse,
    authenticatedFetch,
  } = useAuthenticatedApi();

  const baseUrl = `${apiBase}/${resourceName}`;

  const list = useFetch<TEntity[]>(baseUrl, {
    headers: computed(() => {
      return getAuthHeaders();
    }),
    async onResponseError({ response }) {
      const refreshed = await handleAuthError(response.status);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- 自動インポートにより any として解決される環境があるため
      if (refreshed === true) {
        await list.refresh();
      }
    },
  });

  const create = async (input: TCreateInput): Promise<TEntity> => {
    const response = await authenticatedFetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      return throwResponseError(response);
    }
    clearNuxtData();
    return parseJsonResponse<TEntity>(response);
  };

  const update = async (id: string, input: TUpdateInput): Promise<TEntity> => {
    const response = await authenticatedFetch(`${baseUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      return throwResponseError(response);
    }
    clearNuxtData();
    return parseJsonResponse<TEntity>(response);
  };

  const deleteItem = async (id: string): Promise<void> => {
    const response = await authenticatedFetch(`${baseUrl}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      return throwResponseError(response);
    }
    clearNuxtData();
  };

  const { data, pending, error, refresh, execute, status } = list;
  return {
    data,
    pending,
    error,
    refresh,
    execute,
    status,
    create,
    update,
    deleteItem,
  };
};

/**
 * 認証付きで単一リソースの詳細を取得する汎用 composable。
 */
export const useCrudResourceItem = <TEntity>(resourceName: string, id: () => string) => {
  const apiBase = useApiBase();
  const { getAuthHeaders, handleAuthError } = useAuthenticatedApi();
  const result = useFetch<TEntity>(
    () => {
      return `${apiBase}/${resourceName}/${id()}`;
    },
    {
      headers: computed(() => {
        return getAuthHeaders();
      }),
      async onResponseError({ response }) {
        const refreshed = await handleAuthError(response.status);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- 自動インポートにより any として解決される環境があるため
        if (refreshed === true) {
          await result.refresh();
        }
      },
    }
  );
  return result;
};
