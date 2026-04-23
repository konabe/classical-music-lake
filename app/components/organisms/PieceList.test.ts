import { mountSuspended } from "@nuxt/test-utils/runtime";
import PieceList from "./PieceList.vue";
import type { Piece } from "~/types";

const COMPOSER_ID_BEETHOVEN = "00000000-0000-4000-8000-000000000001";
const COMPOSER_ID_MOZART = "00000000-0000-4000-8000-000000000002";

const composerNameById = {
  [COMPOSER_ID_BEETHOVEN]: "ベートーヴェン",
  [COMPOSER_ID_MOZART]: "モーツァルト",
};

const makePieces = (): Piece[] => [
  {
    id: "piece-1",
    title: "交響曲第9番",
    composerId: COMPOSER_ID_BEETHOVEN,
    videoUrl: "https://www.youtube.com/watch?v=abc123",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "piece-2",
    title: "魔笛",
    composerId: COMPOSER_ID_MOZART,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

const baseEmptyProps = { pieces: [], error: null, composerNameById } as const;

describe("PieceList", () => {
  describe("エラー状態", () => {
    it("error がある場合はエラーメッセージを表示する", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { ...baseEmptyProps, error: new Error("fetch failed") },
      });
      expect(wrapper.findComponent({ name: "ErrorMessage" }).exists()).toBe(true);
    });

    it("error がある場合は EmptyState が表示されない", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { ...baseEmptyProps, error: new Error("fetch failed") },
      });
      expect(wrapper.findComponent({ name: "EmptyState" }).exists()).toBe(false);
    });
  });

  describe("空の状態", () => {
    it("pieces が空のとき EmptyState が表示される", async () => {
      const wrapper = await mountSuspended(PieceList, { props: baseEmptyProps });
      expect(wrapper.findComponent({ name: "EmptyState" }).exists()).toBe(true);
    });

    it("pieces が空のとき ul が表示されない", async () => {
      const wrapper = await mountSuspended(PieceList, { props: baseEmptyProps });
      expect(wrapper.find("ul.piece-list").exists()).toBe(false);
    });
  });

  describe("リスト表示", () => {
    it("pieces があるとき ul が表示される", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: makePieces(), error: null, composerNameById },
      });
      expect(wrapper.find("ul.piece-list").exists()).toBe(true);
    });

    it("pieces があるとき EmptyState が表示されない", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: makePieces(), error: null, composerNameById },
      });
      expect(wrapper.findComponent({ name: "EmptyState" }).exists()).toBe(false);
    });

    it("楽曲の件数分 PieceItem が表示される", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: makePieces(), error: null, composerNameById },
      });
      expect(wrapper.findAllComponents({ name: "PieceItem" })).toHaveLength(2);
    });

    it("composerNameById から作曲家名が解決される", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: makePieces(), error: null, composerNameById },
      });
      expect(wrapper.text()).toContain("ベートーヴェン");
      expect(wrapper.text()).toContain("モーツァルト");
    });
  });

  describe("イベント", () => {
    it("削除ボタンをクリックすると delete イベントが emit される", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: makePieces(), error: null, composerNameById },
      });
      await wrapper.findAll(".btn-danger")[0].trigger("click");
      expect(wrapper.emitted("delete")).toBeDefined();
    });

    it("1件目の削除で piece-1 の Piece が emit される", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: makePieces(), error: null, composerNameById },
      });
      await wrapper.findAll(".btn-danger")[0].trigger("click");
      const emitted = wrapper.emitted("delete") as [Piece][];
      expect(emitted[0][0].id).toBe("piece-1");
    });

    it("詳細ボタンクリックで詳細ページへ遷移する", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: makePieces(), error: null, composerNameById },
      });
      const routerPushSpy = vi.spyOn(wrapper.vm.$router, "push");
      await wrapper.findAll(".btn-detail")[0].trigger("click");
      expect(routerPushSpy).toHaveBeenCalledWith("/pieces/piece-1");
    });

    it("サムネイルクリックで詳細ページへ遷移する", async () => {
      const wrapper = await mountSuspended(PieceList, {
        props: { pieces: makePieces(), error: null, composerNameById },
      });
      const routerPushSpy = vi.spyOn(wrapper.vm.$router, "push");
      await wrapper.find(".piece-thumbnail").trigger("click");
      expect(routerPushSpy).toHaveBeenCalledWith("/pieces/piece-1");
    });
  });
});
