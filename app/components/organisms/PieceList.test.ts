import { mountSuspended } from "@nuxt/test-utils/runtime";
import PieceList from "./PieceList.vue";
import type { Piece } from "~/types";

const makePieces = (): Piece[] => {
  return [
    {
      id: "piece-1",
      title: "交響曲第9番",
      composer: "ベートーヴェン",
      videoUrl: "https://www.youtube.com/watch?v=abc123",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "piece-2",
      title: "魔笛",
      composer: "モーツァルト",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ];
};

describe("PieceList", () => {
  describe("エラー状態", () => {
    it("error がある場合はエラーメッセージを表示する", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: [], error: new Error("fetch failed") },
      });
      expect(wrapper.findComponent({ name: "ErrorMessage" }).exists()).toBe(true);
    });

    it("error がある場合は EmptyState が表示されない", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: [], error: new Error("fetch failed") },
      });
      expect(wrapper.findComponent({ name: "EmptyState" }).exists()).toBe(false);
    });
  });

  describe("空の状態", () => {
    it("pieces が空のとき EmptyState が表示される", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: [], error: null },
      });
      expect(wrapper.findComponent({ name: "EmptyState" }).exists()).toBe(true);
    });

    it("pieces が空のとき ul が表示されない", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: [], error: null },
      });
      expect(wrapper.find("ul.piece-list").exists()).toBe(false);
    });
  });

  describe("リスト表示", () => {
    it("pieces があるとき ul が表示される", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: makePieces(), error: null },
      });
      expect(wrapper.find("ul.piece-list").exists()).toBe(true);
    });

    it("pieces があるとき EmptyState が表示されない", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: makePieces(), error: null },
      });
      expect(wrapper.findComponent({ name: "EmptyState" }).exists()).toBe(false);
    });

    it("楽曲の件数分 PieceItem が表示される", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: makePieces(), error: null },
      });
      expect(wrapper.findAllComponents({ name: "PieceItem" })).toHaveLength(2);
    });
  });

  describe("イベント", () => {
    it("削除ボタンをクリックすると delete イベントが emit される", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: makePieces(), error: null },
      });
      await wrapper.findAll(".btn-danger")[0].trigger("click");
      expect(wrapper.emitted("delete")).toBeDefined();
    });

    it("1件目の削除で piece-1 の Piece が emit される", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: makePieces(), error: null },
      });
      await wrapper.findAll(".btn-danger")[0].trigger("click");
      const emitted = wrapper.emitted("delete") as [Piece][];
      expect(emitted[0][0].id).toBe("piece-1");
    });

    it("詳細ボタンクリックで autoplay なしの詳細ページへ遷移する", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: makePieces(), error: null },
      });
      const routerPushSpy = vi.spyOn(wrapper.vm.$router, "push");
      await wrapper.findAll(".btn-detail")[0].trigger("click");
      expect(routerPushSpy).toHaveBeenCalledWith("/pieces/piece-1");
    });

    it("サムネイルクリックで autoplay=1 付きの詳細ページへ遷移する", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: makePieces(), error: null },
      });
      const routerPushSpy = vi.spyOn(wrapper.vm.$router, "push");
      await wrapper.find(".piece-thumbnail").trigger("click");
      expect(routerPushSpy).toHaveBeenCalledWith("/pieces/piece-1?autoplay=1");
    });
  });
});
