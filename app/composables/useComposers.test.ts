import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useComposersAll, useComposer } from "@/composables/useComposers";
import type { Composer } from "@/types";
import { COMPOSERS_PAGE_SIZE_MAX } from "@/types";
import { ID_TOKEN_KEY } from "@/composables/useAuth";

const { mockUseFetch } = vi.hoisted(() => ({
  mockUseFetch: vi.fn(),
}));

mockUseFetch.mockReturnValue({ data: ref(null), error: ref(null), pending: ref(false) });

mockNuxtImport("useApiBase", () => () => "/api");
mockNuxtImport("useFetch", () => mockUseFetch);

const mockDollarFetch = vi.fn();
const mockFetch = vi.fn();
const mockRouterPush = vi.fn();
const mockRefreshTokens = vi.fn();

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

const makeComposer = (id: string, name = `name-${id}`): Composer => ({
  id,
  name,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
});

const jsonResponse = <T>(body: T, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

beforeEach(() => {
  vi.stubGlobal("$fetch", mockDollarFetch);
  vi.stubGlobal("fetch", mockFetch);
  mockDollarFetch.mockReset();
  mockFetch.mockReset();
  mockRouterPush.mockClear();
  mockRefreshTokens.mockClear();
  mockRefreshTokens.mockResolvedValue(false);
  mockUseFetch.mockClear();
  mockUseFetch.mockReturnValue({ data: ref(null), error: ref(null), pending: ref(false) });
  localStorage.clear();
});

describe("useComposersAll", () => {
  describe("refresh", () => {
    it("limit=COMPOSERS_PAGE_SIZE_MAX で /api/composers を呼ぶ", async () => {
      mockDollarFetch.mockResolvedValueOnce({ items: [], nextCursor: null });
      const c = useComposersAll();
      await c.refresh();
      expect(mockDollarFetch).toHaveBeenCalledWith("/api/composers", {
        query: { limit: COMPOSERS_PAGE_SIZE_MAX },
      });
    });

    it("取得結果を data に反映する", async () => {
      const composers = [makeComposer("1"), makeComposer("2")];
      mockDollarFetch.mockResolvedValueOnce({ items: composers, nextCursor: null });
      const c = useComposersAll();
      await c.refresh();
      expect(c.data.value).toEqual(composers);
    });

    it("nextCursor が non-null の場合はエラーを設定する", async () => {
      mockDollarFetch.mockResolvedValueOnce({ items: [], nextCursor: "next-cursor" });
      const c = useComposersAll();
      await c.refresh();
      expect(c.error.value).not.toBeNull();
    });
  });

  describe("mutation", () => {
    it("createComposer が POST + Authorization ヘッダで送信する", async () => {
      localStorage.setItem(ID_TOKEN_KEY, "test-id-token");
      mockFetch.mockResolvedValueOnce(jsonResponse(makeComposer("new"), 201));
      // refresh の呼び出し（成功時の再取得）
      mockDollarFetch.mockResolvedValueOnce({ items: [], nextCursor: null });
      const c = useComposersAll();
      await c.createComposer({ name: "ベートーヴェン" });
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/composers",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "ベートーヴェン" }),
          headers: expect.objectContaining({
            Authorization: "Bearer test-id-token",
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("updateComposer が PUT で送信する", async () => {
      localStorage.setItem(ID_TOKEN_KEY, "test-id-token");
      mockFetch.mockResolvedValueOnce(jsonResponse(makeComposer("123", "updated")));
      mockDollarFetch.mockResolvedValueOnce({ items: [], nextCursor: null });
      const c = useComposersAll();
      await c.updateComposer("123", { name: "updated" });
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/composers/123",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ name: "updated" }),
        }),
      );
    });

    it("deleteComposer が DELETE で送信する", async () => {
      localStorage.setItem(ID_TOKEN_KEY, "test-id-token");
      mockFetch.mockResolvedValueOnce(new Response(null, { status: 204 }));
      mockDollarFetch.mockResolvedValueOnce({ items: [], nextCursor: null });
      const c = useComposersAll();
      await c.deleteComposer("123");
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/composers/123",
        expect.objectContaining({ method: "DELETE" }),
      );
    });

    it("createComposer 成功後に refresh が走り data が再取得される", async () => {
      const newList = [makeComposer("2")];
      mockFetch.mockResolvedValueOnce(jsonResponse(makeComposer("2"), 201));
      mockDollarFetch.mockResolvedValueOnce({ items: newList, nextCursor: null });
      const c = useComposersAll();
      await c.createComposer({ name: "x" });
      expect(c.data.value).toEqual(newList);
    });
  });
});

describe("useComposer", () => {
  it("正しい URL で useFetch を呼び出す", () => {
    useComposer(() => "composer-123");
    expect(mockUseFetch).toHaveBeenCalled();
  });
});
