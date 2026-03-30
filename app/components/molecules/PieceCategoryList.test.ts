import { mountSuspended } from "@nuxt/test-utils/runtime";
import PieceCategoryList from "./PieceCategoryList.vue";
import type { Piece } from "~/types";

const allCategories: Pick<Piece, "genre" | "era" | "formation" | "region"> = {
  genre: "交響曲",
  era: "ロマン派",
  formation: "管弦楽",
  region: "ドイツ・オーストリア",
};

const noCategories: Pick<Piece, "genre" | "era" | "formation" | "region"> = {};

describe("PieceCategoryList", () => {
  describe("カテゴリあり", () => {
    it("設定されたカテゴリのバッジが表示される", async () => {
      const wrapper = await mountSuspended(PieceCategoryList, {
        props: { piece: allCategories },
      });
      expect(wrapper.text()).toContain("ジャンル: 交響曲");
      expect(wrapper.text()).toContain("時代: ロマン派");
      expect(wrapper.text()).toContain("編成: 管弦楽");
      expect(wrapper.text()).toContain("地域: ドイツ・オーストリア");
    });

    it("一部のみ設定されている場合、設定分だけ表示される", async () => {
      const wrapper = await mountSuspended(PieceCategoryList, {
        props: { piece: { genre: "協奏曲" } },
      });
      expect(wrapper.text()).toContain("ジャンル: 協奏曲");
      expect(wrapper.text()).not.toContain("時代:");
      expect(wrapper.text()).not.toContain("編成:");
      expect(wrapper.text()).not.toContain("地域:");
    });
  });

  describe("カテゴリなし", () => {
    it("全カテゴリが未設定の場合、コンテナが表示されない", async () => {
      const wrapper = await mountSuspended(PieceCategoryList, {
        props: { piece: noCategories },
      });
      expect(wrapper.find(".piece-category-list").exists()).toBe(false);
    });
  });
});
