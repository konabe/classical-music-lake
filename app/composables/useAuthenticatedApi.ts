import { useRouter } from "#app";
import { useAuth, ID_TOKEN_KEY } from "./useAuth";

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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- 自動インポートにより any として解決される環境があるため
    if (refreshed === true) {
      return true;
    }

    clearTokens();
    router.push("/auth/login");
    return false;
  };

  const throwResponseError = async (response: Response): Promise<never> => {
    const errorBody = await response.json().catch(() => {
      return {};
    });
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
    options: { method?: string; headers?: Record<string, string>; body?: string }
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
          : "Network error occurred. Please check your connection."
      );
    }
  };

  const authenticatedFetch = async (
    url: string,
    options: { method?: string; headers?: Record<string, string>; body?: string } = {}
  ): Promise<Response> => {
    const response = await doFetch(url, options);

    if (response.status === 401) {
      const refreshed = await handleAuthError(response.status);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- 自動インポートにより any として解決される環境があるため
      if (refreshed === true) {
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

  return {
    getAuthHeaders,
    handleAuthError,
    throwResponseError,
    parseJsonResponse,
    authenticatedFetch,
  };
};
