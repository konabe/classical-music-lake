import { mountSuspended } from "@nuxt/test-utils/runtime";
import RequiredMark from "@/components/atoms/RequiredMark.vue";

describe("RequiredMark", () => {
  it("「required」テキストが表示される", async () => {
    const wrapper = await mountSuspended(RequiredMark);
    expect(wrapper.text()).toBe("required");
  });

  it("required クラスが存在する", async () => {
    const wrapper = await mountSuspended(RequiredMark);
    expect(wrapper.find(".required").exists()).toBe(true);
  });

  it("span 要素として描画される", async () => {
    const wrapper = await mountSuspended(RequiredMark);
    expect(wrapper.element.tagName.toLowerCase()).toBe("span");
  });

  it("aria-label に「必須」が設定される", async () => {
    const wrapper = await mountSuspended(RequiredMark);
    expect(wrapper.attributes("aria-label")).toBe("必須");
  });
});
