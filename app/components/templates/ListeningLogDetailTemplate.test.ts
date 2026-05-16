import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ListeningLogDetailTemplate from "@/components/templates/ListeningLogDetailTemplate.vue";
import ButtonDanger from "@/components/atoms/ButtonDanger.vue";
import ButtonSecondary from "@/components/atoms/ButtonSecondary.vue";
import type { ListeningLog } from "@/types";

const mockDeleteLog = vi.fn();

vi.mock("~/composables/useListeningLogs", () => ({
  useListeningLogs: () => ({
    data: null,
    error: null,
    pending: false,
    refresh: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteLog: mockDeleteLog,
  }),
}));

const sampleLog: ListeningLog = {
  id: "log-123",
  userId: null,
  listenedAt: "2024-03-01T14:00:00.000Z",
  pieceId: "piece-1",
  pieceTitle: "交響曲第9番 ニ短調 Op.125",
  composerId: "composer-1",
  composerName: "ベートーヴェン",
  rating: 5,
  isFavorite: false,
  createdAt: "2024-03-01T14:00:00.000Z",
  updatedAt: "2024-03-01T14:00:00.000Z",
};

beforeEach(() => {
  mockDeleteLog.mockClear();
  vi.stubGlobal(
    "confirm",
    vi.fn(() => true),
  );
});

describe("ListeningLogDetailTemplate", () => {
  describe("表示", () => {
    it("編集ボタンが表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogDetailTemplate, {
        props: { log: sampleLog },
        global: { components: { ButtonSecondary, ButtonDanger } },
      });
      expect(wrapper.find(".btn-secondary").exists()).toBe(true);
    });

    it("削除ボタンが表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogDetailTemplate, {
        props: { log: sampleLog },
        global: { components: { ButtonSecondary, ButtonDanger } },
      });
      expect(wrapper.find(".btn-danger").exists()).toBe(true);
    });
  });

  describe("削除", () => {
    it("削除ボタンをクリックすると confirm が表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogDetailTemplate, {
        props: { log: sampleLog },
        global: { components: { ButtonSecondary, ButtonDanger } },
      });
      await wrapper.find(".btn-danger").trigger("click");
      expect(globalThis.confirm).toHaveBeenCalledWith("この鑑賞記録を削除しますか？");
    });

    it("confirm で OK を選択すると deleteLog が呼ばれる", async () => {
      mockDeleteLog.mockResolvedValue(undefined);
      const wrapper = await mountSuspended(ListeningLogDetailTemplate, {
        props: { log: sampleLog },
        global: { components: { ButtonSecondary, ButtonDanger } },
      });
      await wrapper.find(".btn-danger").trigger("click");
      await flushPromises();
      expect(mockDeleteLog).toHaveBeenCalledWith("log-123");
    });

    it("confirm で OK を選択すると一覧ページへ遷移する", async () => {
      mockDeleteLog.mockResolvedValue(undefined);
      const wrapper = await mountSuspended(ListeningLogDetailTemplate, {
        props: { log: sampleLog },
        global: { components: { ButtonSecondary, ButtonDanger } },
      });
      const routerPushSpy = vi.spyOn(wrapper.vm.$router, "push");
      await wrapper.find(".btn-danger").trigger("click");
      await flushPromises();
      expect(routerPushSpy).toHaveBeenCalledWith("/listening-logs");
    });

    it("confirm でキャンセルすると deleteLog が呼ばれない", async () => {
      vi.stubGlobal(
        "confirm",
        vi.fn(() => false),
      );
      const wrapper = await mountSuspended(ListeningLogDetailTemplate, {
        props: { log: sampleLog },
        global: { components: { ButtonSecondary, ButtonDanger } },
      });
      await wrapper.find(".btn-danger").trigger("click");
      expect(mockDeleteLog).not.toHaveBeenCalled();
    });
  });
});
