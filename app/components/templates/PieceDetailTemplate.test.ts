import { mountSuspended } from "@nuxt/test-utils/runtime";
import PieceDetailTemplate from "./PieceDetailTemplate.vue";
import type { Piece } from "~/types";

const pieceWithVideo: Piece = {
  id: "1",
  title: "交響曲第9番 ニ短調 Op.125",
  composer: "ベートーヴェン",
  videoUrl: "https://www.youtube.com/watch?v=abc123",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const pieceWithCategories: Piece = {
  id: "3",
  title: "春の祭典",
  composer: "ストラヴィンスキー",
  genre: "その他",
  era: "近現代",
  formation: "管弦楽",
  region: "ロシア",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const pieceWithoutVideo: Piece = {
  id: "2",
  title: "魔笛",
  composer: "モーツァルト",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("PieceDetailTemplate", () => {
  describe("videoUrl あり", () => {
    it("曲名が表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: { piece: pieceWithVideo, error: null },
      });
      expect(wrapper.text()).toContain("交響曲第9番 ニ短調 Op.125");
    });

    it("作曲家が表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: { piece: pieceWithVideo, error: null },
      });
      expect(wrapper.text()).toContain("ベートーヴェン");
    });

    it("VideoPlayer が表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: { piece: pieceWithVideo, error: null },
      });
      expect(wrapper.find(".video-player").exists()).toBe(true);
    });

    it("再生前は QuickLogForm が表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: { piece: pieceWithVideo, error: null },
      });
      expect(wrapper.find(".quick-log-form").exists()).toBe(false);
    });
  });

  describe("videoUrl なし", () => {
    it("曲名が表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: { piece: pieceWithoutVideo, error: null },
      });
      expect(wrapper.text()).toContain("魔笛");
    });

    it("VideoPlayer が表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: { piece: pieceWithoutVideo, error: null },
      });
      expect(wrapper.find(".video-player").exists()).toBe(false);
    });

    it("QuickLogForm が表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: { piece: pieceWithoutVideo, error: null },
      });
      expect(wrapper.find(".quick-log-form").exists()).toBe(false);
    });
  });

  describe("エラー表示", () => {
    it("error が null でない場合はエラーメッセージが表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: { piece: null, error: new Error("取得失敗") },
      });
      expect(wrapper.find(".error-message").exists()).toBe(true);
    });
  });

  describe("カテゴリ表示", () => {
    it("genre が設定されている場合、ジャンルバッジが表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: { piece: pieceWithCategories, error: null },
      });
      expect(wrapper.text()).toContain("ジャンル: その他");
    });

    it("genre が未設定の場合、ジャンルバッジが表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: { piece: pieceWithoutVideo, error: null },
      });
      expect(wrapper.text()).not.toContain("ジャンル:");
    });

    it("全カテゴリが未設定の場合、バッジが一切表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: { piece: pieceWithoutVideo, error: null },
      });
      expect(wrapper.text()).not.toContain("ジャンル:");
      expect(wrapper.text()).not.toContain("時代:");
      expect(wrapper.text()).not.toContain("編成:");
      expect(wrapper.text()).not.toContain("地域:");
    });
  });
});
