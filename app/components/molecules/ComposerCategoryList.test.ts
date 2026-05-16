import { mountSuspended } from "@nuxt/test-utils/runtime";
import ComposerCategoryList from "@/components/molecules/ComposerCategoryList.vue";

describe("ComposerCategoryList", () => {
  describe("表示", () => {
    it("era と region の両方が指定されているとバッジを 2 つ表示する", async () => {
      const wrapper = await mountSuspended(ComposerCategoryList, {
        props: {
          composer: { era: "ロマン派", region: "ドイツ・オーストリア" },
        },
      });
      expect(wrapper.findAll(".category-badge")).toHaveLength(2);
    });

    it("era のみのときはバッジを 1 つ表示する", async () => {
      const wrapper = await mountSuspended(ComposerCategoryList, {
        props: {
          composer: { era: "バロック" },
        },
      });
      expect(wrapper.findAll(".category-badge")).toHaveLength(1);
    });

    it("カテゴリがなにも指定されていないとリスト自体を描画しない", async () => {
      const wrapper = await mountSuspended(ComposerCategoryList, {
        props: { composer: {} },
      });
      expect(wrapper.find(".composer-category-list").exists()).toBe(false);
    });
  });
});
