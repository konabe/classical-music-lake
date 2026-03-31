import { useRouter } from "#app";
import { useAuth, ID_TOKEN_KEY } from "./useAuth";
import type { CreateListeningLogInput, ListeningLog, UpdateListeningLogInput } from "~/types";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(ID_TOKEN_KEY);
  return token !== null ? { Authorization: `Bearer ${token}` } : {};
};

const handleAuthError = async (
  status: number,
  router: ReturnType<typeof useRouter>
): Promise<boolean> => {
  if (status !== 401) return false;

  const { refreshTokens, clearTokens } = useAuth();
  const refreshed = await refreshTokens();
  if (refreshed === true) return true;

  clearTokens();
  router.push("/auth/login");
  return false;
};

const throwResponseError = async (response: Response): Promise<never> => {
  const errorBody = await response.json().catch(() => ({}));
  const message =
    (errorBody as { message?: string }).message ?? `Request failed with status ${response.status}`;
  throw new Error(message);
};

export const useListeningLogs = () => {
  const apiBase = useApiBase();
  const router = useRouter();

  const authenticatedFetch = async (
    url: string,
    options: { method?: string; headers?: Record<string, string>; body?: string } = {}
  ): Promise<Response> => {
    const response = await fetch(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    });

    if (response.status === 401) {
      const refreshed = await handleAuthError(response.status, router);
      if (refreshed === true) {
        const retried = await fetch(url, {
          ...options,
          headers: { ...getAuthHeaders(), ...options.headers },
        });
        if (retried.status === 401) {
          const { clearTokens } = useAuth();
          clearTokens();
          router.push("/auth/login");
        }
        return retried;
      }
    }

    return response;
  };

  const list = useFetch<ListeningLog[]>(`${apiBase}/listening-logs`, {
    headers: computed(() => getAuthHeaders()),
    async onResponseError({ response }) {
      const refreshed = await handleAuthError(response.status, router);
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
    if (!response.ok) return throwResponseError(response);
    return response.json();
  };

  const update = async (id: string, input: UpdateListeningLogInput): Promise<ListeningLog> => {
    const response = await authenticatedFetch(`${apiBase}/listening-logs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) return throwResponseError(response);
    return response.json();
  };

  const deleteLog = async (id: string): Promise<void> => {
    const response = await authenticatedFetch(`${apiBase}/listening-logs/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) return throwResponseError(response);
  };

  return { ...list, create, update, deleteLog };
};

export const useListeningLog = (id: () => string) => {
  const apiBase = useApiBase();
  const router = useRouter();
  const result = useFetch<ListeningLog>(() => `${apiBase}/listening-logs/${id()}`, {
    headers: computed(() => getAuthHeaders()),
    async onResponseError({ response }) {
      const refreshed = await handleAuthError(response.status, router);
      if (refreshed === true) {
        await result.refresh();
      }
    },
  });
  return result;
};
