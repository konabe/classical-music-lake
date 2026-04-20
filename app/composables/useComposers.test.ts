import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useComposersPaginated, useComposer } from "./useComposers";
import type { PageResult } from "./usePaginatedList";
import type { Composer } from "~/types";
import { COMPOSERS_PAGE_SIZE_DEFAULT } from "~/types";
import { ID_TOKEN_KEY } from "./useAuth";

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
  const actual = await importOriginal<typeof import("./useAuth")>();
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

describe("useComposersPaginated", () => {
  describe("loadMore", () => {
    it("既定の limit を付けて /api/composers を呼ぶ", async () => {
      mockDollarFetch.mockResolvedValueOnce({
        items: [],
        nextCursor: null,
      } satisfies PageResult<Composer>);
      const c = useComposersPaginated();
      await c.loadMore();
      expect(mockDollarFetch).toHaveBeenCalledWith("/api/composers", {
        query: { limit: COMPOSERS_PAGE_SIZE_DEFAULT },
      });
    });

    it("取得した items を反映し、nextCursor が null なら hasMore=false になる", async () => {
      const composers = [makeComposer("1"), makeComposer("2")];
      mockDollarFetch.mockResolvedValueOnce({ items: composers, nextCursor: null });
      const c = useComposersPaginated();
      await c.loadMore();
      expect(c.items.value).toEqual(composers);
      expect(c.hasMore.value).toBe(false);
    });
  });

  describe("mutation", () => {
    it("createComposer が正しい URL と body で POST し、Authorization ヘッダを付与する", async () => {
      localStorage.setItem(ID_TOKEN_KEY, "test-id-token");
      mockFetch.mockResolvedValueOnce(jsonResponse(makeComposer("new"), 201));
      const c = useComposersPaginated();
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
        })
      );
    });

    it("updateComposer が正しい URL と body で PUT し、Authorization ヘッダを付与する", async () => {
      localStorage.setItem(ID_TOKEN_KEY, "test-id-token");
      mockFetch.mockResolvedValueOnce(jsonResponse(makeComposer("123", "updated")));
      const c = useComposersPaginated();
      await c.updateComposer("123", { name: "updated" });
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/composers/123",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ name: "updated" }),
          headers: expect.objectContaining({
            Authorization: "Bearer test-id-token",
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("deleteComposer が DELETE を送り Authorization ヘッダを付与する", async () => {
      localStorage.setItem(ID_TOKEN_KEY, "test-id-token");
      mockFetch.mockResolvedValueOnce(new Response(null, { status: 204 }));
      const c = useComposersPaginated();
      await c.deleteComposer("123");
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/composers/123",
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: "Bearer test-id-token",
          }),
        })
      );
    });

    it("createComposer が 401 を返したら throwResponseError がエラーにする", async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 })
      );
      const c = useComposersPaginated();
      await expect(c.createComposer({ name: "x" })).rejects.toThrow();
    });

    it("createComposer 成功後に items がリセットされる", async () => {
      mockDollarFetch.mockResolvedValueOnce({ items: [makeComposer("1")], nextCursor: null });
      mockFetch.mockResolvedValueOnce(jsonResponse(makeComposer("2"), 201));
      const c = useComposersPaginated();
      await c.loadMore();
      expect(c.items.value).toHaveLength(1);
      await c.createComposer({ name: "x" });
      expect(c.items.value).toEqual([]);
      expect(c.hasMore.value).toBe(true);
    });
  });
});

describe("useComposer", () => {
  it("正しい URL で useFetch を呼び出す", () => {
    useComposer(() => "composer-123");
    expect(mockUseFetch).toHaveBeenCalled();
  });
});
