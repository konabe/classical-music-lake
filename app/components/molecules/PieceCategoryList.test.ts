import { mountSuspended } from "@nuxt/test-utils/runtime";
import PieceCategoryList from "@/components/molecules/PieceCategoryList.vue";
import type { PieceWork } from "@/types";

const allCategories: Pick<PieceWork, "genre" | "era" | "formation" | "region"> = {
  genre: "交響曲",
  era: "ロマン派",
  formation: "管弦楽",
  region: "ドイツ・オーストリア",
};

const noCategories: Pick<PieceWork, "genre" | "era" | "formation" | "region"> = {};

describe("PieceCategoryList", () => {
  describe("カテゴリあり", () => {
    it("設定された値がすべて表示される", async () => {
      const wrapper = await mountSuspended(PieceCategoryList, {
        props: { piece: allCategories },
      });
      expect(wrapper.text()).toContain("交響曲");
      expect(wrapper.text()).toContain("ロマン派");
      expect(wrapper.text()).toContain("管弦楽");
      expect(wrapper.text()).toContain("ドイツ・オーストリア");
    });

    it("ラベルは aria-label として付与される", async () => {
      const wrapper = await mountSuspended(PieceCategoryList, {
        props: { piece: allCategories },
      });
      const ariaLabels = wrapper
        .findAll(".category-badge")
        .map((el) => el.attributes("aria-label"));
      expect(ariaLabels).toContain("ジャンル: 交響曲");
      expect(ariaLabels).toContain("時代: ロマン派");
      expect(ariaLabels).toContain("編成: 管弦楽");
      expect(ariaLabels).toContain("地域: ドイツ・オーストリア");
    });

    it("kind クラスが付与される", async () => {
      const wrapper = await mountSuspended(PieceCategoryList, {
        props: { piece: allCategories },
      });
      expect(wrapper.find(".kind-genre").exists()).toBe(true);
      expect(wrapper.find(".kind-era").exists()).toBe(true);
      expect(wrapper.find(".kind-formation").exists()).toBe(true);
      expect(wrapper.find(".kind-region").exists()).toBe(true);
    });

    it("一部のみ設定されている場合、設定分だけ表示される", async () => {
      const wrapper = await mountSuspended(PieceCategoryList, {
        props: { piece: { genre: "協奏曲" } },
      });
      expect(wrapper.find(".kind-genre").exists()).toBe(true);
      expect(wrapper.find(".kind-era").exists()).toBe(false);
      expect(wrapper.find(".kind-formation").exists()).toBe(false);
      expect(wrapper.find(".kind-region").exists()).toBe(false);
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
