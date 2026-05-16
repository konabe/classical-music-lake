import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useConcertLogs } from "@/composables/useConcertLogs";
import {
  ACCESS_TOKEN_KEY,
  ID_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  TOKEN_EXPIRES_AT_KEY,
} from "@/composables/useAuth";

const mockFetch = vi.fn();
const mockRouterPush = vi.fn();
const mockRefreshTokens = vi.fn();

vi.mock("./useApiBase", () => ({
  useApiBase: () => "https://api.example.com",
}));

vi.mock("#app", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock("./useAuth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/composables/useAuth")>();
  return {
    ...actual,
    useAuth: () => ({
      refreshTokens: mockRefreshTokens,
      clearTokens: () => {
        localStorage.removeItem(actual.ACCESS_TOKEN_KEY);
        localStorage.removeItem(actual.ID_TOKEN_KEY);
        localStorage.removeItem(actual.REFRESH_TOKEN_KEY);
        localStorage.removeItem(actual.TOKEN_EXPIRES_AT_KEY);
      },
    }),
  };
});

const { mockUseFetch } = vi.hoisted(() => ({ mockUseFetch: vi.fn() }));

mockNuxtImport("useFetch", () => mockUseFetch);

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockClear();
  mockRouterPush.mockClear();
  mockRefreshTokens.mockClear();
  mockRefreshTokens.mockResolvedValue(false);
  mockUseFetch.mockClear();
  mockUseFetch.mockReturnValue({ data: null, error: null, pending: false, refresh: vi.fn() });
  localStorage.clear();
});

describe("useConcertLogs", () => {
  describe("list", () => {
    it("401 エラー時にトークンを削除してログイン画面へリダイレクトする", async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "expired-access-token");
      localStorage.setItem(ID_TOKEN_KEY, "expired-id-token");
      localStorage.setItem(REFRESH_TOKEN_KEY, "expired-refresh-token");
      localStorage.setItem(TOKEN_EXPIRES_AT_KEY, "1234567890");

      let capturedOnResponseError:
        | ((ctx: { response: { status: number } }) => Promise<void>)
        | undefined;

      mockUseFetch.mockImplementation(
        (
          _url: unknown,
          options: { onResponseError?: (ctx: { response: { status: number } }) => Promise<void> },
        ) => {
          capturedOnResponseError = options?.onResponseError;
          return { data: null, error: null, pending: false, refresh: vi.fn() };
        },
      );

      useConcertLogs();
      await capturedOnResponseError?.({ response: { status: 401 } });

      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(ID_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(TOKEN_EXPIRES_AT_KEY)).toBeNull();
      expect(mockRouterPush).toHaveBeenCalledWith("/auth/login");
    });

    it("401 以外のエラー時はリダイレクトしない", () => {
      let capturedOnResponseError: ((ctx: { response: { status: number } }) => void) | undefined;

      mockUseFetch.mockImplementation(
        (
          _url: unknown,
          options: { onResponseError?: (ctx: { response: { status: number } }) => void },
        ) => {
          capturedOnResponseError = options?.onResponseError;
          return { data: null, error: null, pending: false, refresh: vi.fn() };
        },
      );

      useConcertLogs();
      capturedOnResponseError?.({ response: { status: 500 } });

      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("Authorization ヘッダーに Bearer トークンが付加される", async () => {
      const token = "test-id-token";
      localStorage.setItem(ID_TOKEN_KEY, token);

      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ id: "new-id", title: "定期演奏会" }),
      });

      const { create } = useConcertLogs();
      await create({
        title: "定期演奏会 第123回",
        concertDate: "2024-01-15T19:00:00.000Z",
        venue: "サントリーホール",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/concert-logs",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        }),
      );
    });

    it("401 エラー時にトークンを削除してログイン画面へリダイレクトし、エラーをスローする", async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "expired-token");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      const { create } = useConcertLogs();
      await expect(
        create({
          title: "定期演奏会",
          concertDate: "2024-01-15T19:00:00.000Z",
          venue: "サントリーホール",
        }),
      ).rejects.toThrow("Unauthorized");

      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
      expect(mockRouterPush).toHaveBeenCalledWith("/auth/login");
    });

    it("4xx/5xx エラー時にエラーメッセージをスローする", async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "test-token");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: "Bad Request" }),
      });

      const { create } = useConcertLogs();
      await expect(
        create({
          title: "定期演奏会",
          concertDate: "2024-01-15T19:00:00.000Z",
          venue: "サントリーホール",
        }),
      ).rejects.toThrow("Bad Request");
    });
  });

  describe("update", () => {
    it("Authorization ヘッダーに Bearer トークンが付加される", async () => {
      const token = "test-id-token";
      localStorage.setItem(ID_TOKEN_KEY, token);

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: "abc-123", title: "更新後のコンサート" }),
      });

      const { update } = useConcertLogs();
      await update("abc-123", { title: "更新後のコンサート" });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/concert-logs/abc-123",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        }),
      );
    });

    it("401 エラー時にトークンを削除してログイン画面へリダイレクトし、エラーをスローする", async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "expired-token");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      const { update } = useConcertLogs();
      await expect(update("abc-123", { title: "更新後" })).rejects.toThrow("Unauthorized");

      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
      expect(mockRouterPush).toHaveBeenCalledWith("/auth/login");
    });

    it("404 エラー時にエラーメッセージをスローする", async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "test-token");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: "Not Found" }),
      });

      const { update } = useConcertLogs();
      await expect(update("abc-123", { title: "更新後" })).rejects.toThrow("Not Found");
    });
  });

  describe("deleteLog", () => {
    it("Authorization ヘッダーに Bearer トークンが付加される", async () => {
      const token = "test-id-token";
      localStorage.setItem(ID_TOKEN_KEY, token);

      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      const { deleteLog } = useConcertLogs();
      await deleteLog("abc-123");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/concert-logs/abc-123",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        }),
      );
    });

    it("204 レスポンスで正常完了する（レスポンスボディなし）", async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "test-token");

      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      const { deleteLog } = useConcertLogs();
      await expect(deleteLog("abc-123")).resolves.toBeUndefined();
    });

    it("401 エラー時にトークンを削除してログイン画面へリダイレクトし、エラーをスローする", async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "expired-token");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      const { deleteLog } = useConcertLogs();
      await expect(deleteLog("abc-123")).rejects.toThrow("Unauthorized");

      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
      expect(mockRouterPush).toHaveBeenCalledWith("/auth/login");
    });

    it("404 エラー時にエラーメッセージをスローする", async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "test-token");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: "Not Found" }),
      });

      const { deleteLog } = useConcertLogs();
      await expect(deleteLog("abc-123")).rejects.toThrow("Not Found");
    });
  });
});
