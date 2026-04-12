import type { CreateListeningLogInput, ListeningLog, UpdateListeningLogInput } from "~/types";
import { useAuthenticatedApi } from "./useAuthenticatedApi";

export const useListeningLogs = () => {
  const apiBase = useApiBase();
  const {
    getAuthHeaders,
    handleAuthError,
    throwResponseError,
    parseJsonResponse,
    authenticatedFetch,
  } = useAuthenticatedApi();

  const list = useFetch<ListeningLog[]>(`${apiBase}/listening-logs`, {
    headers: computed(() => getAuthHeaders()),
    async onResponseError({ response }) {
      const refreshed = await handleAuthError(response.status);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- 自動インポートにより any として解決される環境があるため
      if (refreshed === true) {
        await list.refresh();
      }
    },
  });

  const create = async (input: CreateListeningLogInput): Promise<ListeningLog> => {
    const response = await authenticatedFetch(`${apiBase}/listening-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      return throwResponseError(response);
    }
    clearNuxtData();
    return parseJsonResponse<ListeningLog>(response);
  };

  const update = async (id: string, input: UpdateListeningLogInput): Promise<ListeningLog> => {
    const response = await authenticatedFetch(`${apiBase}/listening-logs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      return throwResponseError(response);
    }
    clearNuxtData();
    return parseJsonResponse<ListeningLog>(response);
  };

  const deleteLog = async (id: string): Promise<void> => {
    const response = await authenticatedFetch(`${apiBase}/listening-logs/${id}`, {
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
    deleteLog,
  };
};

export const useListeningLog = (id: () => string) => {
  const apiBase = useApiBase();
  const { getAuthHeaders, handleAuthError } = useAuthenticatedApi();
  const result = useFetch<ListeningLog>(() => `${apiBase}/listening-logs/${id()}`, {
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
