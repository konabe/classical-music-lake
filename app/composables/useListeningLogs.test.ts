import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useListeningLogs } from "./useListeningLogs";
import { ACCESS_TOKEN_KEY, ID_TOKEN_KEY } from "./useAuth";

const mockFetch = vi.fn();
const mockRouterPush = vi.fn();

vi.mock("./useApiBase", () => ({
  useApiBase: () => "https://api.example.com",
}));

vi.mock("#app", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

const { mockUseFetch } = vi.hoisted(() => ({ mockUseFetch: vi.fn() }));

mockNuxtImport("useFetch", () => mockUseFetch);

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockClear();
  mockRouterPush.mockClear();
  mockUseFetch.mockClear();
  mockUseFetch.mockReturnValue({ data: null, error: null, pending: false, refresh: vi.fn() });
  localStorage.clear();
});

describe("useListeningLogs", () => {
  describe("list", () => {
    it("401 エラー時にトークンを削除してログイン画面へリダイレクトする", () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "expired-access-token");
      localStorage.setItem(ID_TOKEN_KEY, "expired-id-token");

      let capturedOnResponseError: ((ctx: { response: { status: number } }) => void) | undefined;

      mockUseFetch.mockImplementation(
        (
          _url: unknown,
          options: { onResponseError?: (ctx: { response: { status: number } }) => void }
        ) => {
          capturedOnResponseError = options?.onResponseError;
          return { data: null, error: null, pending: false, refresh: vi.fn() };
        }
      );

      useListeningLogs();
      capturedOnResponseError?.({ response: { status: 401 } });

      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(ID_TOKEN_KEY)).toBeNull();
      expect(mockRouterPush).toHaveBeenCalledWith("/auth/login");
    });

    it("401 以外のエラー時はリダイレクトしない", () => {
      let capturedOnResponseError: ((ctx: { response: { status: number } }) => void) | undefined;

      mockUseFetch.mockImplementation(
        (
          _url: unknown,
          options: { onResponseError?: (ctx: { response: { status: number } }) => void }
        ) => {
          capturedOnResponseError = options?.onResponseError;
          return { data: null, error: null, pending: false, refresh: vi.fn() };
        }
      );

      useListeningLogs();
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
        json: async () => ({ id: "new-id", composer: "バッハ" }),
      });

      const { create } = useListeningLogs();
      await create({
        listenedAt: "2024-01-15T20:00:00.000Z",
        composer: "バッハ",
        piece: "ゴルトベルク変奏曲",
        rating: 5,
        isFavorite: false,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/listening-logs",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        })
      );
    });

    it("401 エラー時にトークンを削除してログイン画面へリダイレクトし、エラーをスローする", async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "expired-token");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      const { create } = useListeningLogs();
      await expect(
        create({
          listenedAt: "2024-01-15T20:00:00.000Z",
          composer: "バッハ",
          piece: "ゴルトベルク変奏曲",
          rating: 5,
          isFavorite: false,
        })
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

      const { create } = useListeningLogs();
      await expect(
        create({
          listenedAt: "2024-01-15T20:00:00.000Z",
          composer: "バッハ",
          piece: "ゴルトベルク変奏曲",
          rating: 5,
          isFavorite: false,
        })
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
        json: async () => ({ id: "abc-123", rating: 4 }),
      });

      const { update } = useListeningLogs();
      await update("abc-123", { rating: 4 });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/listening-logs/abc-123",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        })
      );
    });

    it("401 エラー時にトークンを削除してログイン画面へリダイレクトし、エラーをスローする", async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "expired-token");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      const { update } = useListeningLogs();
      await expect(update("abc-123", { rating: 4 })).rejects.toThrow("Unauthorized");

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

      const { update } = useListeningLogs();
      await expect(update("abc-123", { rating: 4 })).rejects.toThrow("Not Found");
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

      const { deleteLog } = useListeningLogs();
      await deleteLog("abc-123");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/listening-logs/abc-123",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        })
      );
    });

    it("204 レスポンスで正常完了する（レスポンスボディなし）", async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "test-token");

      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      const { deleteLog } = useListeningLogs();
      await expect(deleteLog("abc-123")).resolves.toBeUndefined();
    });

    it("401 エラー時にトークンを削除してログイン画面へリダイレクトし、エラーをスローする", async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "expired-token");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      const { deleteLog } = useListeningLogs();
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

      const { deleteLog } = useListeningLogs();
      await expect(deleteLog("abc-123")).rejects.toThrow("Not Found");
    });
  });
});
