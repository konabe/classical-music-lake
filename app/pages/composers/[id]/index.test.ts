import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ComposerDetailPage from "./index.vue";
import type { Composer } from "~/types";

const mockDeleteComposer = vi.fn();

const sampleComposer: Composer = {
  id: "composer-1",
  name: "ベートーヴェン",
  era: "古典派",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

vi.mock("~/composables/useComposers", () => ({
  useComposersPaginated: () => ({
    items: ref([]),
    nextCursor: ref(null),
    pending: ref(false),
    error: ref(null),
    hasMore: ref(true),
    loadMore: vi.fn(),
    reset: vi.fn(),
    retry: vi.fn(),
    createComposer: vi.fn(),
    updateComposer: vi.fn(),
    deleteComposer: mockDeleteComposer,
  }),
  useComposer: () => ({ data: ref(sampleComposer), error: ref(null) }),
}));

beforeEach(() => {
  mockDeleteComposer.mockClear();
  vi.stubGlobal(
    "confirm",
    vi.fn(() => true)
  );
  vi.stubGlobal("alert", vi.fn());
});

describe("ComposerDetailPage", () => {
  describe("表示", () => {
    it("ComposerDetailTemplate が表示される", async () => {
      const wrapper = await mountSuspended(ComposerDetailPage);
      expect(wrapper.findComponent({ name: "ComposerDetailTemplate" }).exists()).toBe(true);
    });

    it("作曲家名が表示される", async () => {
      const wrapper = await mountSuspended(ComposerDetailPage);
      expect(wrapper.text()).toContain("ベートーヴェン");
    });
  });

  describe("削除", () => {
    it("削除確認で OK を選ぶと deleteComposer が呼ばれる", async () => {
      mockDeleteComposer.mockResolvedValue(undefined);
      const wrapper = await mountSuspended(ComposerDetailPage);
      const vm = wrapper.vm as { handleDelete: (target: Composer) => Promise<void> };
      await vm.handleDelete(sampleComposer);
      await flushPromises();
      expect(mockDeleteComposer).toHaveBeenCalledWith("composer-1");
    });

    it("削除キャンセル時は deleteComposer が呼ばれない", async () => {
      vi.stubGlobal(
        "confirm",
        vi.fn(() => false)
      );
      const wrapper = await mountSuspended(ComposerDetailPage);
      const vm = wrapper.vm as { handleDelete: (target: Composer) => Promise<void> };
      await vm.handleDelete(sampleComposer);
      expect(mockDeleteComposer).not.toHaveBeenCalled();
    });

    it("削除失敗時は alert が呼ばれる", async () => {
      const alertSpy = vi.fn();
      vi.stubGlobal("alert", alertSpy);
      mockDeleteComposer.mockRejectedValue(new Error("failed"));
      const wrapper = await mountSuspended(ComposerDetailPage);
      const vm = wrapper.vm as { handleDelete: (target: Composer) => Promise<void> };
      await vm.handleDelete(sampleComposer);
      await flushPromises();
      expect(alertSpy).toHaveBeenCalled();
    });
  });
});
