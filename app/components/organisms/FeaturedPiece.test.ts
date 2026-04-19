import { mountSuspended } from "@nuxt/test-utils/runtime";
import FeaturedPiece from "./FeaturedPiece.vue";
import type { Piece } from "~/types";

const makePiece = (overrides: Partial<Piece> = {}): Piece => {
  return {
    id: "piece-1",
    title: "ピアノ協奏曲第1番 変ロ短調 Op.23",
    composer: "チャイコフスキー",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
};

const stubs = { VideoPlayer: true };

describe("FeaturedPiece", () => {
  describe("表示", () => {
    it("ローディング中はパルスアニメーションを表示する", async () => {
      const wrapper = await mountSuspended(FeaturedPiece, {
        props: { pieces: [], loading: true },
        global: { stubs },
      });
      expect(wrapper.find(".loading-pulse").exists()).toBe(true);
    });

    it("動画付き楽曲がないとき空状態メッセージを表示する", async () => {
      const wrapper = await mountSuspended(FeaturedPiece, {
        props: { pieces: [makePiece({ videoUrl: undefined })], loading: false },
        global: { stubs },
      });
      expect(wrapper.find(".featured-empty").exists()).toBe(true);
    });

    it("動画付き楽曲があるとき曲名と作曲家を表示する", async () => {
      const wrapper = await mountSuspended(FeaturedPiece, {
        props: { pieces: [makePiece()], loading: false },
        global: { stubs },
      });
      expect(wrapper.find(".piece-title").text()).toContain("ピアノ協奏曲第1番 変ロ短調 Op.23");
      expect(wrapper.find(".piece-composer").text()).toContain("チャイコフスキー");
    });

    it("楽曲が1件のとき別の曲を見るボタンを表示しない", async () => {
      const wrapper = await mountSuspended(FeaturedPiece, {
        props: { pieces: [makePiece()], loading: false },
        global: { stubs },
      });
      expect(wrapper.find(".shuffle-btn").exists()).toBe(false);
    });

    it("楽曲が2件以上のとき別の曲を見るボタンを表示する", async () => {
      const wrapper = await mountSuspended(FeaturedPiece, {
        props: {
          pieces: [
            makePiece({ id: "1" }),
            makePiece({ id: "2", title: "交響曲第5番 ハ短調 Op.67", composer: "ベートーヴェン" }),
          ],
          loading: false,
        },
        global: { stubs },
      });
      expect(wrapper.find(".shuffle-btn").exists()).toBe(true);
    });
  });

  describe("イベント", () => {
    it("別の曲を見るボタンをクリックすると別の楽曲が表示される", async () => {
      const pieces = [
        makePiece({ id: "1", title: "ピアノ協奏曲第1番" }),
        makePiece({ id: "2", title: "交響曲第5番", composer: "ベートーヴェン" }),
        makePiece({ id: "3", title: "バイオリン協奏曲", composer: "ブラームス" }),
      ];
      const wrapper = await mountSuspended(FeaturedPiece, {
        props: { pieces, loading: false },
        global: { stubs },
      });
      const before = wrapper.find(".piece-title").text();
      await wrapper.find(".shuffle-btn").trigger("click");
      const after = wrapper.find(".piece-title").text();
      expect(after).not.toBe(before);
    });
  });
});
