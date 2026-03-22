import { useRouter } from "#app";
import { ACCESS_TOKEN_KEY, ID_TOKEN_KEY } from "./useAuth";
import type { CreateListeningLogInput, ListeningLog, UpdateListeningLogInput } from "~/types";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(ID_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleAuthError = (status: number, router: ReturnType<typeof useRouter>): void => {
  if (status === 401) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(ID_TOKEN_KEY);
    router.push("/auth/login");
  }
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
  const list = useFetch<ListeningLog[]>(`${apiBase}/listening-logs`, {
    headers: computed(() => getAuthHeaders()),
  });

  const create = async (input: CreateListeningLogInput): Promise<ListeningLog> => {
    const response = await fetch(`${apiBase}/listening-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(input),
    });
    handleAuthError(response.status, router);
    if (!response.ok) return throwResponseError(response);
    return response.json();
  };

  const update = async (id: string, input: UpdateListeningLogInput): Promise<ListeningLog> => {
    const response = await fetch(`${apiBase}/listening-logs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(input),
    });
    handleAuthError(response.status, router);
    if (!response.ok) return throwResponseError(response);
    return response.json();
  };

  const deleteLog = async (id: string): Promise<void> => {
    const response = await fetch(`${apiBase}/listening-logs/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    handleAuthError(response.status, router);
    if (!response.ok) return throwResponseError(response);
  };

  return { ...list, create, update, deleteLog };
};

export const useListeningLog = (id: () => string) => {
  const apiBase = useApiBase();
  return useFetch<ListeningLog>(() => `${apiBase}/listening-logs/${id()}`, {
    headers: computed(() => getAuthHeaders()),
  });
};
