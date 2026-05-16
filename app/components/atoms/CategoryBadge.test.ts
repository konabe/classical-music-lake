import { mountSuspended } from "@nuxt/test-utils/runtime";
import CategoryBadge from "@/components/atoms/CategoryBadge.vue";

describe("CategoryBadge", () => {
  describe("表示", () => {
    it("category-badge クラスが存在する", async () => {
      const wrapper = await mountSuspended(CategoryBadge, {
        props: { label: "ジャンル", value: "交響曲" },
      });
      expect(wrapper.find(".category-badge").exists()).toBe(true);
    });

    it("value がテキストに含まれる", async () => {
      const wrapper = await mountSuspended(CategoryBadge, {
        props: { label: "ジャンル", value: "交響曲" },
      });
      expect(wrapper.find(".badge-value").text()).toBe("交響曲");
    });

    it("label と value は aria-label として連結される", async () => {
      const wrapper = await mountSuspended(CategoryBadge, {
        props: { label: "時代", value: "ロマン派" },
      });
      expect(wrapper.find(".category-badge").attributes("aria-label")).toBe("時代: ロマン派");
    });
  });

  describe("kind による色分け", () => {
    it("kind 未指定時は kind-default クラスが付与される", async () => {
      const wrapper = await mountSuspended(CategoryBadge, {
        props: { label: "ジャンル", value: "交響曲" },
      });
      expect(wrapper.find(".category-badge").classes()).toContain("kind-default");
    });

    it("kind=genre のとき kind-genre クラスが付与される", async () => {
      const wrapper = await mountSuspended(CategoryBadge, {
        props: { kind: "genre", label: "ジャンル", value: "交響曲" },
      });
      expect(wrapper.find(".category-badge").classes()).toContain("kind-genre");
    });

    it("kind=era のとき kind-era クラスが付与される", async () => {
      const wrapper = await mountSuspended(CategoryBadge, {
        props: { kind: "era", label: "時代", value: "ロマン派" },
      });
      expect(wrapper.find(".category-badge").classes()).toContain("kind-era");
    });

    it("kind=formation のとき kind-formation クラスが付与される", async () => {
      const wrapper = await mountSuspended(CategoryBadge, {
        props: { kind: "formation", label: "編成", value: "管弦楽" },
      });
      expect(wrapper.find(".category-badge").classes()).toContain("kind-formation");
    });

    it("kind=region のとき kind-region クラスが付与される", async () => {
      const wrapper = await mountSuspended(CategoryBadge, {
        props: { kind: "region", label: "地域", value: "フランス" },
      });
      expect(wrapper.find(".category-badge").classes()).toContain("kind-region");
    });
  });
});
