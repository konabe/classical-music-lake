import { describe, it, expect, vi, beforeEach } from "vitest";
import { useListeningLogs } from "./useListeningLogs";
import { ACCESS_TOKEN_KEY } from "./useAuth";

const mockFetch = vi.fn();
const mockRouterPush = vi.fn();

vi.mock("./useApiBase", () => ({
  useApiBase: () => "https://api.example.com",
}));

vi.mock("#app", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockClear();
  mockRouterPush.mockClear();
  localStorage.clear();
});

describe("useListeningLogs", () => {
  describe("create", () => {
    it("Authorization ヘッダーに Bearer トークンが付加される", async () => {
      const token = "test-access-token";
      localStorage.setItem(ACCESS_TOKEN_KEY, token);

      mockFetch.mockResolvedValue({
        ok: true,
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

    it("401 エラー時にログイン画面へリダイレクトする", async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "expired-token");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      const { create } = useListeningLogs();
      await create({
        listenedAt: "2024-01-15T20:00:00.000Z",
        composer: "バッハ",
        piece: "ゴルトベルク変奏曲",
        rating: 5,
        isFavorite: false,
      });

      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
      expect(mockRouterPush).toHaveBeenCalledWith("/auth/login");
    });
  });

  describe("update", () => {
    it("Authorization ヘッダーに Bearer トークンが付加される", async () => {
      const token = "test-access-token";
      localStorage.setItem(ACCESS_TOKEN_KEY, token);

      mockFetch.mockResolvedValue({
        ok: true,
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

    it("401 エラー時にログイン画面へリダイレクトする", async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "expired-token");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      const { update } = useListeningLogs();
      await update("abc-123", { rating: 4 });

      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
      expect(mockRouterPush).toHaveBeenCalledWith("/auth/login");
    });
  });

  describe("deleteLog", () => {
    it("Authorization ヘッダーに Bearer トークンが付加される", async () => {
      const token = "test-access-token";
      localStorage.setItem(ACCESS_TOKEN_KEY, token);

      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
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

    it("401 エラー時にログイン画面へリダイレクトする", async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, "expired-token");

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      const { deleteLog } = useListeningLogs();
      await deleteLog("abc-123");

      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
      expect(mockRouterPush).toHaveBeenCalledWith("/auth/login");
    });
  });
});
