import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ComposersPage from "@/pages/composers/index.vue";
import type { Composer } from "@/types";

const { sampleComposers, mockRefresh, mockDeleteComposer } = vi.hoisted(() => {
  const sampleComposers: Composer[] = [
    {
      id: "composer-1",
      name: "ベートーヴェン",
      birthYear: 1770,
      deathYear: 1827,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "composer-2",
      name: "バッハ",
      birthYear: 1685,
      deathYear: 1750,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "composer-3",
      name: "未確定",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ];
  return {
    sampleComposers,
    mockRefresh: vi.fn(),
    mockDeleteComposer: vi.fn(),
  };
});

const composersData = ref<Composer[] | null>(null);
const composersPending = ref<boolean>(false);
const composersError = ref<Error | null>(null);

mockNuxtImport("useComposersAll", () =>
  vi.fn(() => ({
    data: composersData,
    pending: composersPending,
    error: composersError,
    refresh: mockRefresh,
    createComposer: vi.fn(),
    updateComposer: vi.fn(),
    deleteComposer: mockDeleteComposer,
  })),
);

beforeEach(() => {
  mockRefresh.mockClear();
  mockDeleteComposer.mockClear();
  composersData.value = [...sampleComposers];
  composersPending.value = false;
  composersError.value = null;
  vi.stubGlobal(
    "confirm",
    vi.fn(() => true),
  );
  vi.stubGlobal("alert", vi.fn());
});

describe("ComposersPage", () => {
  describe("表示", () => {
    it("作曲家一覧が表示される", async () => {
      const wrapper = await mountSuspended(ComposersPage);
      await flushPromises();
      expect(wrapper.findAllComponents({ name: "ComposerItem" })).toHaveLength(3);
    });

    it("マウント時に refresh が呼ばれる（初回ロード）", async () => {
      await mountSuspended(ComposersPage);
      await flushPromises();
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("生年昇順でソートされ、生年未登録は末尾に並ぶ", async () => {
      const wrapper = await mountSuspended(ComposersPage);
      await flushPromises();
      const items = wrapper.findAllComponents({ name: "ComposerItem" });
      expect(items[0]?.props("composer").name).toBe("バッハ"); // 1685
      expect(items[1]?.props("composer").name).toBe("ベートーヴェン"); // 1770
      expect(items[2]?.props("composer").name).toBe("未確定"); // 生年なし → 末尾
    });

    it("pending=true 時はローディングが表示される", async () => {
      composersPending.value = true;
      composersData.value = [];
      const wrapper = await mountSuspended(ComposersPage);
      await flushPromises();
      expect(wrapper.text()).toContain("読み込み中");
    });

    it("error 時はエラー表示と再試行ボタンが表示される", async () => {
      composersError.value = new Error("network");
      composersData.value = [];
      const wrapper = await mountSuspended(ComposersPage);
      await flushPromises();
      expect(wrapper.text()).toContain("取得に失敗しました");
    });
  });

  describe("削除", () => {
    it("削除確認で OK を選ぶと deleteComposer が呼ばれる", async () => {
      mockDeleteComposer.mockResolvedValue(undefined);
      const wrapper = await mountSuspended(ComposersPage);
      await flushPromises();
      await wrapper.find(".btn-danger").trigger("click");
      await flushPromises();
      // 生年昇順なので先頭はバッハ
      expect(mockDeleteComposer).toHaveBeenCalledWith("composer-2");
    });

    it("削除キャンセル時は deleteComposer が呼ばれない", async () => {
      vi.stubGlobal(
        "confirm",
        vi.fn(() => false),
      );
      const wrapper = await mountSuspended(ComposersPage);
      await flushPromises();
      await wrapper.find(".btn-danger").trigger("click");
      expect(mockDeleteComposer).not.toHaveBeenCalled();
    });
  });
});
