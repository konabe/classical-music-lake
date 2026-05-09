import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { usePiecesPaginated, usePiecesAll, usePiece } from "./usePieces";
import type { PageResult } from "./usePaginatedList";
import type { PieceWork } from "~/types";
import { ID_TOKEN_KEY } from "./useAuth";
import {
  PIECES_PAGE_SIZE_DEFAULT,
  PIECES_ALL_MAX_EMPTY_PAGES,
  PIECES_ALL_MAX_TOTAL,
} from "~/types";

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

const makePiece = (id: string, title = `title-${id}`): PieceWork => ({
  kind: "work",
  id,
  title,
  composerId: "00000000-0000-4000-8000-000000000001",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
});

const jsonResponse = <T>(body: T, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const flush = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};

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

describe("usePiecesPaginated", () => {
  describe("初期状態と loadMore", () => {
    it("初期状態は items 空・hasMore=true・pending=false", () => {
      const p = usePiecesPaginated();
      expect(p.items.value).toEqual([]);
      expect(p.hasMore.value).toBe(true);
      expect(p.pending.value).toBe(false);
      expect(p.error.value).toBeNull();
    });

    it("loadMore で既定の limit を付けて /api/pieces を呼ぶ", async () => {
      mockDollarFetch.mockResolvedValueOnce({
        items: [],
        nextCursor: null,
      } satisfies PageResult<PieceWork>);
      const p = usePiecesPaginated();
      await p.loadMore();
      expect(mockDollarFetch).toHaveBeenCalledWith("/api/pieces", {
        query: { limit: PIECES_PAGE_SIZE_DEFAULT },
      });
    });

    it("取得した items を反映し、nextCursor が null なら hasMore=false になる", async () => {
      const pieces = [makePiece("1"), makePiece("2")];
      mockDollarFetch.mockResolvedValueOnce({ items: pieces, nextCursor: null });
      const p = usePiecesPaginated();
      await p.loadMore();
      expect(p.items.value).toEqual(pieces);
      expect(p.hasMore.value).toBe(false);
    });

    it("複数回の loadMore で items を追記する", async () => {
      const page1 = [makePiece("1")];
      const page2 = [makePiece("2")];
      mockDollarFetch
        .mockResolvedValueOnce({ items: page1, nextCursor: "cursor-1" })
        .mockResolvedValueOnce({ items: page2, nextCursor: null });
      const p = usePiecesPaginated();
      await p.loadMore();
      await p.loadMore();
      expect(p.items.value).toEqual([...page1, ...page2]);
      expect(mockDollarFetch).toHaveBeenNthCalledWith(2, "/api/pieces", {
        query: { limit: PIECES_PAGE_SIZE_DEFAULT, cursor: "cursor-1" },
      });
    });

    it("hasMore=false になったら loadMore を呼んでもリクエストを発行しない", async () => {
      mockDollarFetch.mockResolvedValueOnce({ items: [], nextCursor: null });
      const p = usePiecesPaginated();
      await p.loadMore();
      expect(p.hasMore.value).toBe(false);
      await p.loadMore();
      expect(mockDollarFetch).toHaveBeenCalledTimes(1);
    });

    it("pending 中に loadMore を呼んでも二重発行しない", async () => {
      let resolvePage: ((value: PageResult<PieceWork>) => void) | undefined;
      mockDollarFetch.mockReturnValueOnce(
        new Promise<PageResult<PieceWork>>((resolve) => {
          resolvePage = resolve;
        }),
      );
      const p = usePiecesPaginated();
      const first = p.loadMore();
      const second = p.loadMore();
      expect(p.pending.value).toBe(true);
      resolvePage?.({ items: [makePiece("1")], nextCursor: null });
      await first;
      await second;
      expect(mockDollarFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("エラーと retry", () => {
    it("fetch が失敗すると error に反映される", async () => {
      mockDollarFetch.mockRejectedValueOnce(new Error("network"));
      const p = usePiecesPaginated();
      await p.loadMore();
      expect(p.error.value).toBeInstanceOf(Error);
      expect(p.pending.value).toBe(false);
    });

    it("retry 後に再度成功すれば items に反映される", async () => {
      mockDollarFetch
        .mockRejectedValueOnce(new Error("network"))
        .mockResolvedValueOnce({ items: [makePiece("1")], nextCursor: null });
      const p = usePiecesPaginated();
      await p.loadMore();
      expect(p.error.value).not.toBeNull();
      await p.retry();
      expect(p.error.value).toBeNull();
      expect(p.items.value).toHaveLength(1);
    });
  });

  describe("reset と mutation", () => {
    it("reset を呼ぶと items・nextCursor・error がリセットされる", async () => {
      mockDollarFetch.mockResolvedValueOnce({ items: [makePiece("1")], nextCursor: "c1" });
      const p = usePiecesPaginated();
      await p.loadMore();
      expect(p.items.value).toHaveLength(1);
      p.reset();
      expect(p.items.value).toEqual([]);
      expect(p.hasMore.value).toBe(true);
      expect(p.error.value).toBeNull();
    });

    it("createPiece 成功後に items が空にリセットされる", async () => {
      mockDollarFetch.mockResolvedValueOnce({ items: [makePiece("1")], nextCursor: null });
      mockFetch.mockResolvedValueOnce(jsonResponse(makePiece("2"), 201));
      const p = usePiecesPaginated();
      await p.loadMore();
      expect(p.items.value).toHaveLength(1);
      await p.createPiece({
        kind: "work",
        title: "x",
        composerId: "00000000-0000-4000-8000-000000000001",
      });
      expect(p.items.value).toEqual([]);
      expect(p.hasMore.value).toBe(true);
    });

    it("updatePiece 成功後に items が空にリセットされる", async () => {
      mockDollarFetch.mockResolvedValueOnce({ items: [makePiece("1")], nextCursor: null });
      mockFetch.mockResolvedValueOnce(jsonResponse(makePiece("1", "updated")));
      const p = usePiecesPaginated();
      await p.loadMore();
      await p.updatePiece("1", { title: "updated" });
      expect(p.items.value).toEqual([]);
    });

    it("createPiece が正しい URL と body で POST し、Authorization ヘッダを付与する", async () => {
      localStorage.setItem(ID_TOKEN_KEY, "test-id-token");
      mockFetch.mockResolvedValueOnce(jsonResponse(makePiece("new"), 201));
      const p = usePiecesPaginated();
      await p.createPiece({
        kind: "work",
        title: "new",
        composerId: "00000000-0000-4000-8000-000000000001",
      });
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/pieces",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            kind: "work",
            title: "new",
            composerId: "00000000-0000-4000-8000-000000000001",
          }),
          headers: expect.objectContaining({
            Authorization: "Bearer test-id-token",
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("updatePiece が正しい URL と body で PUT し、Authorization ヘッダを付与する", async () => {
      localStorage.setItem(ID_TOKEN_KEY, "test-id-token");
      mockFetch.mockResolvedValueOnce(jsonResponse(makePiece("123", "updated")));
      const p = usePiecesPaginated();
      await p.updatePiece("123", { title: "updated" });
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/pieces/123",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ title: "updated" }),
          headers: expect.objectContaining({
            Authorization: "Bearer test-id-token",
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("createPiece が 401 を返したら throwResponseError がエラーにする", async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 }),
      );
      const p = usePiecesPaginated();
      await expect(
        p.createPiece({
          kind: "work",
          title: "x",
          composerId: "00000000-0000-4000-8000-000000000001",
        }),
      ).rejects.toThrow();
    });
  });
});

describe("usePiecesAll", () => {
  it("auto-paginate で全ページを取得し data に集約する", async () => {
    mockDollarFetch
      .mockResolvedValueOnce({ items: [makePiece("1")], nextCursor: "c1" })
      .mockResolvedValueOnce({ items: [makePiece("2"), makePiece("3")], nextCursor: null });
    const p = usePiecesAll();
    await p.refresh();
    expect(p.data.value).toHaveLength(3);
    expect(p.pending.value).toBe(false);
    expect(mockDollarFetch).toHaveBeenCalledTimes(2);
  });

  it("nextCursor を次回リクエストに引き継ぐ", async () => {
    mockDollarFetch
      .mockResolvedValueOnce({ items: [], nextCursor: "c1" })
      .mockResolvedValueOnce({ items: [], nextCursor: null });
    const p = usePiecesAll();
    await p.refresh();
    expect(mockDollarFetch).toHaveBeenNthCalledWith(2, "/api/pieces", {
      query: { limit: PIECES_PAGE_SIZE_DEFAULT, cursor: "c1" },
    });
  });

  it(`連続 ${PIECES_ALL_MAX_EMPTY_PAGES + 1} 回の空応答が続くと error にする`, async () => {
    for (let i = 0; i <= PIECES_ALL_MAX_EMPTY_PAGES; i += 1) {
      mockDollarFetch.mockResolvedValueOnce({ items: [], nextCursor: `c${i}` });
    }
    const p = usePiecesAll();
    await p.refresh();
    expect(p.error.value).toBeInstanceOf(Error);
  });

  it(`総件数が上限 ${PIECES_ALL_MAX_TOTAL} を超えると error にする`, async () => {
    const bigPage = Array.from({ length: 2500 }, (_, i) => makePiece(String(i)));
    mockDollarFetch
      .mockResolvedValueOnce({ items: bigPage, nextCursor: "c1" })
      .mockResolvedValueOnce({ items: bigPage, nextCursor: "c2" })
      .mockResolvedValueOnce({ items: bigPage, nextCursor: "c3" });
    const p = usePiecesAll();
    await p.refresh();
    expect(p.error.value).toBeInstanceOf(Error);
  });

  it("fetch 失敗時に error が設定される", async () => {
    mockDollarFetch.mockRejectedValueOnce(new Error("boom"));
    const p = usePiecesAll();
    await p.refresh();
    expect(p.error.value).toBeInstanceOf(Error);
  });

  it("createPiece が refresh を引き起こす", async () => {
    mockDollarFetch
      .mockResolvedValueOnce({ items: [makePiece("1")], nextCursor: null })
      .mockResolvedValueOnce({ items: [makePiece("1"), makePiece("2")], nextCursor: null });
    mockFetch.mockResolvedValueOnce(jsonResponse(makePiece("2"), 201));
    const p = usePiecesAll();
    await p.refresh();
    expect(p.data.value).toHaveLength(1);
    await p.createPiece({
      kind: "work",
      title: "x",
      composerId: "00000000-0000-4000-8000-000000000001",
    });
    await flush();
    expect(p.data.value).toHaveLength(2);
  });
});

describe("usePiece", () => {
  it("正しい URL で useFetch を呼び出す", () => {
    usePiece(() => "piece-456");
    expect(mockUseFetch).toHaveBeenCalledWith(expect.any(Function), expect.anything());
  });
});
