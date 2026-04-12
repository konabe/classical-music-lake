import type { ConcertLog, CreateConcertLogInput, UpdateConcertLogInput } from "~/types";
import { useAuthenticatedApi } from "./useAuthenticatedApi";

export const useConcertLogs = () => {
  const apiBase = useApiBase();
  const {
    getAuthHeaders,
    handleAuthError,
    throwResponseError,
    parseJsonResponse,
    authenticatedFetch,
  } = useAuthenticatedApi();

  const list = useFetch<ConcertLog[]>(`${apiBase}/concert-logs`, {
    headers: computed(() => getAuthHeaders()),
    async onResponseError({ response }) {
      const refreshed = await handleAuthError(response.status);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- 自動インポートにより any として解決される環境があるため
      if (refreshed === true) {
        await list.refresh();
      }
    },
  });

  const create = async (input: CreateConcertLogInput): Promise<ConcertLog> => {
    const response = await authenticatedFetch(`${apiBase}/concert-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      return throwResponseError(response);
    }
    clearNuxtData();
    return parseJsonResponse<ConcertLog>(response);
  };

  const update = async (id: string, input: UpdateConcertLogInput): Promise<ConcertLog> => {
    const response = await authenticatedFetch(`${apiBase}/concert-logs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      return throwResponseError(response);
    }
    clearNuxtData();
    return parseJsonResponse<ConcertLog>(response);
  };

  const deleteLog = async (id: string): Promise<void> => {
    const response = await authenticatedFetch(`${apiBase}/concert-logs/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      return throwResponseError(response);
    }
    clearNuxtData();
  };

  const { data, pending, error, refresh, execute, status, then: thenFn } = list;
  return {
    data,
    pending,
    error,
    refresh,
    execute,
    status,
    then: thenFn,
    create,
    update,
    deleteLog,
  };
};

export const useConcertLog = (id: () => string) => {
  const apiBase = useApiBase();
  const { getAuthHeaders, handleAuthError } = useAuthenticatedApi();
  const result = useFetch<ConcertLog>(() => `${apiBase}/concert-logs/${id()}`, {
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
