import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import PieceListInfinite from "@/components/organisms/PieceListInfinite.vue";
import type { PieceWork } from "@/types";

const COMPOSER_ID = "00000000-0000-4000-8000-000000000001";
const composerNameById = { [COMPOSER_ID]: "ベートーヴェン" };

const samplePieces: PieceWork[] = [
  {
    kind: "work",
    id: "piece-1",
    title: "交響曲第9番",
    composerId: COMPOSER_ID,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

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
  observeCallbacks.length = 0;
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

const triggerIntersect = () => {
  for (const cb of observeCallbacks) {
    cb([{ isIntersecting: true }]);
  }
};

describe("PieceListInfinite", () => {
  describe("表示", () => {
    it("楽曲一覧が表示される", async () => {
      const wrapper = await mountSuspended(PieceListInfinite, {
        props: {
          pieces: samplePieces,
          error: null,
          pending: false,
          hasMore: true,
          composerNameById,
        },
      });
      expect(wrapper.findAllComponents({ name: "PieceItem" })).toHaveLength(1);
    });

    it("pending=true 時はローディングが表示される", async () => {
      const wrapper = await mountSuspended(PieceListInfinite, {
        props: {
          pieces: samplePieces,
          error: null,
          pending: true,
          hasMore: true,
          composerNameById,
        },
      });
      expect(wrapper.text()).toContain("読み込み中");
    });

    it("hasMore=false かつ件数あり時は末尾到達メッセージが表示される", async () => {
      const wrapper = await mountSuspended(PieceListInfinite, {
        props: {
          pieces: samplePieces,
          error: null,
          pending: false,
          hasMore: false,
          composerNameById,
        },
      });
      expect(wrapper.text()).toContain("これ以上ありません");
    });

    it("error 時はエラーメッセージと再試行ボタンが表示される", async () => {
      const wrapper = await mountSuspended(PieceListInfinite, {
        props: {
          pieces: samplePieces,
          error: new Error("network"),
          pending: false,
          hasMore: true,
          composerNameById,
        },
      });
      expect(wrapper.text()).toMatch(/取得に失敗/);
      expect(wrapper.find(".btn-retry").exists()).toBe(true);
    });

    it("hasMore=false のときセンチネルはレンダリングされない", async () => {
      const wrapper = await mountSuspended(PieceListInfinite, {
        props: {
          pieces: samplePieces,
          error: null,
          pending: false,
          hasMore: false,
          composerNameById,
        },
      });
      expect(wrapper.find(".sentinel").exists()).toBe(false);
    });

    it("error 発生時はセンチネルをレンダリングしない", async () => {
      const wrapper = await mountSuspended(PieceListInfinite, {
        props: {
          pieces: samplePieces,
          error: new Error("network"),
          pending: false,
          hasMore: true,
          composerNameById,
        },
      });
      expect(wrapper.find(".sentinel").exists()).toBe(false);
    });
  });

  describe("イベント", () => {
    it("センチネル可視化で loadMore を emit する", async () => {
      const wrapper = await mountSuspended(PieceListInfinite, {
        props: {
          pieces: samplePieces,
          error: null,
          pending: false,
          hasMore: true,
          composerNameById,
        },
      });
      await flushPromises();
      triggerIntersect();
      expect(wrapper.emitted("loadMore")).toBeDefined();
    });

    it("再試行ボタンで retry を emit する", async () => {
      const wrapper = await mountSuspended(PieceListInfinite, {
        props: {
          pieces: samplePieces,
          error: new Error("network"),
          pending: false,
          hasMore: true,
          composerNameById,
        },
      });
      await wrapper.find(".btn-retry").trigger("click");
      expect(wrapper.emitted("retry")).toBeDefined();
    });

    it("子の PieceList からの delete を再 emit する", async () => {
      const wrapper = await mountSuspended(PieceListInfinite, {
        props: {
          pieces: samplePieces,
          error: null,
          pending: false,
          hasMore: true,
          composerNameById,
        },
      });
      await wrapper.find(".btn-danger").trigger("click");
      expect(wrapper.emitted("delete")).toBeDefined();
    });
  });
});
