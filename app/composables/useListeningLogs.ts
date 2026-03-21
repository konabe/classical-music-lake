import { useRouter } from "#app";
import { ACCESS_TOKEN_KEY } from "./useAuth";
import type { CreateListeningLogInput, ListeningLog, UpdateListeningLogInput } from "~/types";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleAuthError = (status: number, router: ReturnType<typeof useRouter>): void => {
  if (status === 401) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    router.push("/auth/login");
  }
};

export const useListeningLogs = () => {
  const apiBase = useApiBase();
  const router = useRouter();
  const list = useFetch<ListeningLog[]>(`${apiBase}/listening-logs`, {
    headers: computed(() => getAuthHeaders()),
  });

  const create = async (input: CreateListeningLogInput): Promise<ListeningLog | null> => {
    const response = await fetch(`${apiBase}/listening-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(input),
    });
    handleAuthError(response.status, router);
    if (!response.ok) return null;
    return response.json();
  };

  const update = async (
    id: string,
    input: UpdateListeningLogInput
  ): Promise<ListeningLog | null> => {
    const response = await fetch(`${apiBase}/listening-logs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(input),
    });
    handleAuthError(response.status, router);
    if (!response.ok) return null;
    return response.json();
  };

  const deleteLog = async (id: string): Promise<boolean> => {
    const response = await fetch(`${apiBase}/listening-logs/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    handleAuthError(response.status, router);
    return response.ok;
  };

  return { ...list, create, update, deleteLog };
};

export const useListeningLog = (id: () => string) => {
  const apiBase = useApiBase();
  return useFetch<ListeningLog>(() => `${apiBase}/listening-logs/${id()}`, {
    headers: computed(() => getAuthHeaders()),
  });
};
