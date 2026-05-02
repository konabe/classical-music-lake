import { mountSuspended } from "@nuxt/test-utils/runtime";
import PieceDetailTemplate from "./PieceDetailTemplate.vue";
import type { Piece } from "~/types";

const pieceWithVideo: Piece = {
  id: "1",
  title: "交響曲第9番 ニ短調 Op.125",
  composerId: "00000000-0000-4000-8000-000000000001",
  videoUrl: "https://www.youtube.com/watch?v=abc123",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const pieceWithCategories: Piece = {
  id: "3",
  title: "春の祭典",
  composerId: "00000000-0000-4000-8000-000000000003",
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
  composerId: "00000000-0000-4000-8000-000000000002",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("PieceDetailTemplate", () => {
  describe("videoUrl あり", () => {
    it("曲名が表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.text()).toContain("交響曲第9番 ニ短調 Op.125");
    });

    it("作曲家が表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.text()).toContain("ベートーヴェン");
    });

    it("VideoPlayer が表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".video-player").exists()).toBe(true);
    });

    it("再生前は QuickLogForm が表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".quick-log-form").exists()).toBe(false);
    });

    it("iframe の src に autoplay パラメータが含まれない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find("iframe").attributes("src")).not.toContain("autoplay");
    });
  });

  describe("videoUrl なし", () => {
    it("曲名が表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.text()).toContain("魔笛");
    });

    it("VideoPlayer が表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".video-player").exists()).toBe(false);
    });

    it("QuickLogForm が表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".quick-log-form").exists()).toBe(false);
    });
  });

  describe("エラー表示", () => {
    it("error が null でない場合はエラーメッセージが表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: null,
          error: new Error("取得失敗"),
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".error-message").exists()).toBe(true);
    });
  });

  describe("カテゴリ表示", () => {
    it("genre が設定されている場合、ジャンルバッジが表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithCategories,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".kind-genre .badge-value").text()).toBe("その他");
    });

    it("genre が未設定の場合、ジャンルバッジが表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".kind-genre").exists()).toBe(false);
    });

    it("全カテゴリが未設定の場合、バッジが一切表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".piece-category-list").exists()).toBe(false);
    });
  });

  describe("管理者向け操作", () => {
    it("isAdmin が true のとき編集・削除ボタンが表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: true,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".admin-actions").exists()).toBe(true);
      expect(wrapper.find("a.admin-link").exists()).toBe(true);
      expect(wrapper.find(".admin-link--danger").exists()).toBe(true);
    });

    it("isAdmin が false のとき編集・削除ボタンが表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".admin-actions").exists()).toBe(false);
    });

    it("削除ボタンクリックで delete イベントが emit される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: true,
          composerName: "ベートーヴェン",
        },
      });
      await wrapper.find(".admin-link--danger").trigger("click");
      expect(wrapper.emitted("delete")).toBeDefined();
    });

    it("編集リンクが正しい href を持つ", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: true,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find("a.admin-link").attributes("href")).toBe("/pieces/2/edit");
    });
  });
});
