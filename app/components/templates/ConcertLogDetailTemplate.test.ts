import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ConcertLogDetailTemplate from "./ConcertLogDetailTemplate.vue";
import ButtonDanger from "~/components/atoms/ButtonDanger.vue";
import ButtonSecondary from "~/components/atoms/ButtonSecondary.vue";
import type { ConcertLog, Piece } from "~/types";

const mockDeleteLog = vi.fn();

vi.mock("~/composables/useConcertLogs", () => {
  return {
    useConcertLogs: () => {
      return {
        data: null,
        error: null,
        pending: false,
        refresh: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        deleteLog: mockDeleteLog,
      };
    },
  };
});

const mockPieces: Piece[] = [
  {
    id: "piece-1",
    title: "交響曲第9番",
    composer: "ベートーヴェン",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

vi.mock("~/composables/usePieces", () => {
  return {
    usePiecesPaginated: () => {
      return {
        items: ref([]),
        nextCursor: ref(null),
        pending: ref(false),
        error: ref(null),
        hasMore: ref(true),
        loadMore: vi.fn(),
        reset: vi.fn(),
        retry: vi.fn(),
        createPiece: vi.fn(),
        updatePiece: vi.fn(),
      };
    },
    usePiecesAll: () => {
      return {
        data: ref(mockPieces),
        pending: ref(false),
        error: ref(null),
        refresh: vi.fn(),
        createPiece: vi.fn(),
        updatePiece: vi.fn(),
      };
    },
  };
});

const sampleLog: ConcertLog = {
  id: "log-123",
  userId: "user-1",
  concertDate: "2024-01-15T19:00:00.000Z",
  venue: "サントリーホール",
  conductor: "小澤征爾",
  orchestra: "ベルリン・フィルハーモニー管弦楽団",
  soloist: "アルゲリッチ",
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
};

beforeEach(() => {
  mockDeleteLog.mockClear();
  vi.stubGlobal(
    "confirm",
    vi.fn(() => {
      return true;
    })
  );
});

describe("ConcertLogDetailTemplate", () => {
  describe("表示", () => {
    it("編集ボタンが表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogDetailTemplate, {
        props: { log: sampleLog },
        global: { components: { ButtonSecondary, ButtonDanger } },
      });
      expect(wrapper.find(".btn-secondary").exists()).toBe(true);
    });

    it("削除ボタンが表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogDetailTemplate, {
        props: { log: sampleLog },
        global: { components: { ButtonSecondary, ButtonDanger } },
      });
      expect(wrapper.find(".btn-danger").exists()).toBe(true);
    });
  });

  describe("削除", () => {
    it("削除ボタンをクリックすると confirm が表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogDetailTemplate, {
        props: { log: sampleLog },
        global: { components: { ButtonSecondary, ButtonDanger } },
      });
      await wrapper.find(".btn-danger").trigger("click");
      expect(globalThis.confirm).toHaveBeenCalledWith("このコンサート記録を削除しますか？");
    });

    it("confirm で OK を選択すると deleteLog が呼ばれる", async () => {
      mockDeleteLog.mockResolvedValue(undefined);
      const wrapper = await mountSuspended(ConcertLogDetailTemplate, {
        props: { log: sampleLog },
        global: { components: { ButtonSecondary, ButtonDanger } },
      });
      await wrapper.find(".btn-danger").trigger("click");
      await flushPromises();
      expect(mockDeleteLog).toHaveBeenCalledWith("log-123");
    });

    it("confirm で OK を選択すると一覧ページへ遷移する", async () => {
      mockDeleteLog.mockResolvedValue(undefined);
      const wrapper = await mountSuspended(ConcertLogDetailTemplate, {
        props: { log: sampleLog },
        global: { components: { ButtonSecondary, ButtonDanger } },
      });
      const routerPushSpy = vi.spyOn(wrapper.vm.$router, "push");
      await wrapper.find(".btn-danger").trigger("click");
      await flushPromises();
      expect(routerPushSpy).toHaveBeenCalledWith("/concert-logs");
    });

    it("confirm でキャンセルすると deleteLog が呼ばれない", async () => {
      vi.stubGlobal(
        "confirm",
        vi.fn(() => {
          return false;
        })
      );
      const wrapper = await mountSuspended(ConcertLogDetailTemplate, {
        props: { log: sampleLog },
        global: { components: { ButtonSecondary, ButtonDanger } },
      });
      await wrapper.find(".btn-danger").trigger("click");
      expect(mockDeleteLog).not.toHaveBeenCalled();
    });
  });

  describe("プログラム表示", () => {
    it("pieceIds がある場合、楽曲名が表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogDetailTemplate, {
        props: { log: { ...sampleLog, pieceIds: ["piece-1"] } },
        global: { components: { ButtonSecondary, ButtonDanger } },
      });
      expect(wrapper.text()).toContain("交響曲第9番");
    });
  });
});
