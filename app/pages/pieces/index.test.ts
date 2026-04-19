import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import PiecesPage from "./index.vue";
import type { Piece } from "~/types";

const { samplePieces, sampleComposers, mockLoadMore, mockReset, mockRetry } = vi.hoisted(() => {
  const COMPOSER_ID = "00000000-0000-4000-8000-000000000001";
  const samplePieces: Piece[] = [
    {
      id: "piece-1",
      title: "交響曲第9番",
      composerId: COMPOSER_ID,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ];
  const sampleComposers = [
    {
      id: COMPOSER_ID,
      name: "ベートーヴェン",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ];
  return {
    samplePieces,
    sampleComposers,
    mockLoadMore: vi.fn(),
    mockReset: vi.fn(),
    mockRetry: vi.fn(),
  };
});

const piecesItems = ref<Piece[]>([]);
const piecesPending = ref<boolean>(false);
const piecesError = ref<Error | null>(null);
const piecesHasMore = ref<boolean>(true);

mockNuxtImport("usePiecesPaginated", () =>
  vi.fn(() => ({
    items: piecesItems,
    nextCursor: ref(null),
    pending: piecesPending,
    error: piecesError,
    hasMore: piecesHasMore,
    loadMore: mockLoadMore,
    reset: mockReset,
    retry: mockRetry,
    createPiece: vi.fn(),
    updatePiece: vi.fn(),
  }))
);

mockNuxtImport("useComposersAll", () =>
  vi.fn(() => ({
    data: ref(sampleComposers),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn().mockResolvedValue(undefined),
  }))
);

const mockFetch = vi.fn();

// IntersectionObserver をモックし、observe 時のコールバックを蓄積する
const observeCallbacks: Array<(entries: Array<{ isIntersecting: boolean }>) => void> = [];
class MockIntersectionObserver {
  callback: (entries: Array<{ isIntersecting: boolean }>) => void;
  constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void) {
    this.callback = callback;
    observeCallbacks.push(callback);
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

beforeEach(() => {
  mockLoadMore.mockClear();
  mockReset.mockClear();
  mockRetry.mockClear();
  mockFetch.mockClear();
  piecesItems.value = [...samplePieces];
  piecesPending.value = false;
  piecesError.value = null;
  piecesHasMore.value = true;
  observeCallbacks.length = 0;
  vi.stubGlobal("$fetch", mockFetch);
  vi.stubGlobal(
    "confirm",
    vi.fn(() => true)
  );
  vi.stubGlobal("alert", vi.fn());
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

const triggerIntersect = () => {
  for (const cb of observeCallbacks) {
    cb([{ isIntersecting: true }]);
  }
};

describe("PiecesPage", () => {
  describe("表示とページング", () => {
    it("楽曲一覧が表示される", async () => {
      const wrapper = await mountSuspended(PiecesPage);
      await flushPromises();
      expect(wrapper.findAllComponents({ name: "PieceItem" })).toHaveLength(1);
    });

    it("マウント時に loadMore が呼ばれる（初回ロード）", async () => {
      await mountSuspended(PiecesPage);
      await flushPromises();
      expect(mockLoadMore).toHaveBeenCalled();
    });

    it("センチネル可視化時に loadMore が呼ばれる", async () => {
      await mountSuspended(PiecesPage);
      await flushPromises();
      mockLoadMore.mockClear();
      triggerIntersect();
      await flushPromises();
      expect(mockLoadMore).toHaveBeenCalled();
    });

    it("hasMore=false 時は末尾到達メッセージが表示される", async () => {
      piecesHasMore.value = false;
      const wrapper = await mountSuspended(PiecesPage);
      await flushPromises();
      expect(wrapper.text()).toContain("これ以上ありません");
    });

    it("pending=true 時はローディングが表示される", async () => {
      piecesPending.value = true;
      const wrapper = await mountSuspended(PiecesPage);
      await flushPromises();
      expect(wrapper.text()).toContain("読み込み中");
    });

    it("error 時はエラーメッセージと再試行ボタンが表示される", async () => {
      piecesError.value = new Error("network");
      const wrapper = await mountSuspended(PiecesPage);
      await flushPromises();
      expect(wrapper.text()).toMatch(/取得に失敗|エラー/);
      expect(wrapper.find(".btn-retry").exists()).toBe(true);
    });

    it("再試行ボタンをクリックすると retry が呼ばれる", async () => {
      piecesError.value = new Error("network");
      const wrapper = await mountSuspended(PiecesPage);
      await flushPromises();
      await wrapper.find(".btn-retry").trigger("click");
      expect(mockRetry).toHaveBeenCalled();
    });
  });

  describe("削除", () => {
    it("削除確認で OK を選ぶと $fetch が呼ばれる", async () => {
      mockFetch.mockResolvedValue(undefined);
      const wrapper = await mountSuspended(PiecesPage);
      await flushPromises();
      await wrapper.find(".btn-danger").trigger("click");
      await flushPromises();
      expect(mockFetch).toHaveBeenCalled();
    });

    it("削除後に reset と loadMore が呼ばれて再取得する", async () => {
      mockFetch.mockResolvedValue(undefined);
      const wrapper = await mountSuspended(PiecesPage);
      await flushPromises();
      mockLoadMore.mockClear();
      await wrapper.find(".btn-danger").trigger("click");
      await flushPromises();
      expect(mockReset).toHaveBeenCalled();
      expect(mockLoadMore).toHaveBeenCalled();
    });

    it("削除キャンセル時は $fetch が呼ばれない", async () => {
      vi.stubGlobal(
        "confirm",
        vi.fn(() => false)
      );
      const wrapper = await mountSuspended(PiecesPage);
      await flushPromises();
      await wrapper.find(".btn-danger").trigger("click");
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
