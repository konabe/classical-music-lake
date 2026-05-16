import { useRouter } from "#app";
import { useAuth, ID_TOKEN_KEY } from "@/composables/useAuth";

export const useAuthenticatedApi = () => {
  const router = useRouter();

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem(ID_TOKEN_KEY);
    return token === null ? {} : { Authorization: `Bearer ${token}` };
  };

  const handleAuthError = async (status: number): Promise<boolean> => {
    if (status !== 401) {
      return false;
    }

    const { refreshTokens, clearTokens } = useAuth();
    const refreshed = await refreshTokens();
    if (refreshed) {
      return true;
    }

    clearTokens();
    router.push("/auth/login");
    return false;
  };

  const throwResponseError = async (response: Response): Promise<never> => {
    const errorBody = await response.json().catch(() => ({}));
    const message =
      (errorBody as { message?: string }).message ??
      `Request failed with status ${response.status}`;
    throw new Error(message);
  };

  // レスポンスボディを型安全にパースする。JSONパース失敗時は Error をスローする。
  const parseJsonResponse = async <T>(response: Response): Promise<T> => {
    try {
      return (await response.json()) as T;
    } catch {
      throw new Error("Failed to parse response from server");
    }
  };

  // fetch をラップしてネットワークエラーを正規化する。
  // 注意: リトライ経路は useFetch（GET）と authenticatedFetch（mutations）で分離されており、
  // 同一リクエストで二重リトライは発生しない設計となっている。
  const doFetch = async (
    url: string,
    options: { method?: string; headers?: Record<string, string>; body?: string },
  ): Promise<Response> => {
    try {
      return await fetch(url, {
        ...options,
        headers: { ...getAuthHeaders(), ...options.headers },
      });
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Network error occurred. Please check your connection.",
      );
    }
  };

  const authenticatedFetch = async (
    url: string,
    options: { method?: string; headers?: Record<string, string>; body?: string } = {},
  ): Promise<Response> => {
    const response = await doFetch(url, options);

    if (response.status === 401) {
      const refreshed = await handleAuthError(response.status);
      if (refreshed) {
        const retried = await doFetch(url, options);
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

  const sendJson = async <T>(method: "POST" | "PUT", url: string, body: unknown): Promise<T> => {
    const response = await authenticatedFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return throwResponseError(response);
    }
    return parseJsonResponse<T>(response);
  };

  const postJson = <T>(url: string, body: unknown): Promise<T> => sendJson<T>("POST", url, body);

  const putJson = <T>(url: string, body: unknown): Promise<T> => sendJson<T>("PUT", url, body);

  const deleteResource = async (url: string): Promise<void> => {
    const response = await authenticatedFetch(url, { method: "DELETE" });
    if (!response.ok) {
      return throwResponseError(response);
    }
  };

  return {
    getAuthHeaders,
    handleAuthError,
    throwResponseError,
    parseJsonResponse,
    authenticatedFetch,
    postJson,
    putJson,
    deleteResource,
  };
};
