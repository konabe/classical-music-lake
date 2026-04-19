import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ComposersPage from "./index.vue";
import type { Composer } from "~/types";

const { sampleComposers, mockLoadMore, mockReset, mockRetry, mockDeleteComposer } = vi.hoisted(
  () => {
    const sampleComposers: Composer[] = [
      {
        id: "composer-1",
        name: "ベートーヴェン",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ];
    return {
      sampleComposers,
      mockLoadMore: vi.fn(),
      mockReset: vi.fn(),
      mockRetry: vi.fn(),
      mockDeleteComposer: vi.fn(),
    };
  }
);

const composersItems = ref<Composer[]>([]);
const composersPending = ref<boolean>(false);
const composersError = ref<Error | null>(null);
const composersHasMore = ref<boolean>(true);

mockNuxtImport("useComposersPaginated", () => {
  return vi.fn(() => {
    return {
      items: composersItems,
      nextCursor: ref(null),
      pending: composersPending,
      error: composersError,
      hasMore: composersHasMore,
      loadMore: mockLoadMore,
      reset: mockReset,
      retry: mockRetry,
      createComposer: vi.fn(),
      updateComposer: vi.fn(),
      deleteComposer: mockDeleteComposer,
    };
  });
});

const mockFetch = vi.fn();

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
  mockDeleteComposer.mockClear();
  mockFetch.mockClear();
  composersItems.value = [...sampleComposers];
  composersPending.value = false;
  composersError.value = null;
  composersHasMore.value = true;
  observeCallbacks.length = 0;
  vi.stubGlobal("$fetch", mockFetch);
  vi.stubGlobal(
    "confirm",
    vi.fn(() => {
      return true;
    })
  );
  vi.stubGlobal("alert", vi.fn());
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

describe("ComposersPage", () => {
  describe("表示", () => {
    it("作曲家一覧が表示される", async () => {
      const wrapper = await mountSuspended(ComposersPage);
      await flushPromises();
      expect(wrapper.findAllComponents({ name: "ComposerItem" })).toHaveLength(1);
    });

    it("マウント時に loadMore が呼ばれる（初回ロード）", async () => {
      await mountSuspended(ComposersPage);
      await flushPromises();
      expect(mockLoadMore).toHaveBeenCalled();
    });

    it("hasMore=false 時は末尾到達メッセージが表示される", async () => {
      composersHasMore.value = false;
      const wrapper = await mountSuspended(ComposersPage);
      await flushPromises();
      expect(wrapper.text()).toContain("これ以上ありません");
    });

    it("pending=true 時はローディングが表示される", async () => {
      composersPending.value = true;
      const wrapper = await mountSuspended(ComposersPage);
      await flushPromises();
      expect(wrapper.text()).toContain("読み込み中");
    });
  });

  describe("削除", () => {
    it("削除確認で OK を選ぶと deleteComposer が呼ばれる", async () => {
      mockDeleteComposer.mockResolvedValue(undefined);
      const wrapper = await mountSuspended(ComposersPage);
      await flushPromises();
      await wrapper.find(".btn-danger").trigger("click");
      await flushPromises();
      expect(mockDeleteComposer).toHaveBeenCalledWith("composer-1");
    });

    it("削除キャンセル時は deleteComposer が呼ばれない", async () => {
      vi.stubGlobal(
        "confirm",
        vi.fn(() => {
          return false;
        })
      );
      const wrapper = await mountSuspended(ComposersPage);
      await flushPromises();
      await wrapper.find(".btn-danger").trigger("click");
      expect(mockDeleteComposer).not.toHaveBeenCalled();
    });
  });
});
