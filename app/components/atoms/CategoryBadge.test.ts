import { mountSuspended } from "@nuxt/test-utils/runtime";
import CategoryBadge from "./CategoryBadge.vue";

describe("CategoryBadge", () => {
  it("category-badge クラスが存在する", async () => {
    const wrapper = await mountSuspended(CategoryBadge, {
      props: { label: "ジャンル", value: "交響曲" },
    });
    expect(wrapper.find(".category-badge").exists()).toBe(true);
  });

  it("label と value が表示される", async () => {
    const wrapper = await mountSuspended(CategoryBadge, {
      props: { label: "ジャンル", value: "交響曲" },
    });
    expect(wrapper.text()).toContain("ジャンル");
    expect(wrapper.text()).toContain("交響曲");
  });

  it("label: value の形式で表示される", async () => {
    const wrapper = await mountSuspended(CategoryBadge, {
      props: { label: "時代", value: "ロマン派" },
    });
    expect(wrapper.text()).toContain("時代: ロマン派");
  });
});
