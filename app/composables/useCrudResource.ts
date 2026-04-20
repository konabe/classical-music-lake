import { useAuthenticatedApi } from "./useAuthenticatedApi";

/**
 * 認証付きで単一のリソースエンドポイントに対する CRUD 操作を提供する汎用 composable。
 * `useFetch` で一覧を取得し、401 時はトークンリフレッシュを自動試行する。
 * create / update / deleteItem は成功時に `clearNuxtData()` を呼び出して SSR キャッシュを無効化する。
 */
export const useCrudResource = <TEntity, TCreateInput, TUpdateInput>(resourceName: string) => {
  const apiBase = useApiBase();
  const { getAuthHeaders, handleAuthError, postJson, putJson, deleteResource } =
    useAuthenticatedApi();

  const baseUrl = `${apiBase}/${resourceName}`;

  const list = useFetch<TEntity[]>(baseUrl, {
    headers: computed(() => getAuthHeaders()),
    async onResponseError({ response }) {
      const refreshed = await handleAuthError(response.status);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- 自動インポートにより any として解決される環境があるため
      if (refreshed === true) {
        await list.refresh();
      }
    },
  });

  const create = async (input: TCreateInput): Promise<TEntity> => {
    const result = await postJson<TEntity>(baseUrl, input);
    clearNuxtData();
    return result;
  };

  const update = async (id: string, input: TUpdateInput): Promise<TEntity> => {
    const result = await putJson<TEntity>(`${baseUrl}/${id}`, input);
    clearNuxtData();
    return result;
  };

  const deleteItem = async (id: string): Promise<void> => {
    await deleteResource(`${baseUrl}/${id}`);
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
  const result = useFetch<TEntity>(() => `${apiBase}/${resourceName}/${id()}`, {
    headers: computed(() => getAuthHeaders()),
    async onResponseError({ response }) {
      const refreshed = await handleAuthError(response.status);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- 自動インポートにより any として解決される環境があるため
      if (refreshed === true) {
        await result.refresh();
      }
    },
  });
  return result;
};
