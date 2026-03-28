import { mountSuspended } from "@nuxt/test-utils/runtime";
import AuthLayout from "./auth.vue";

describe("AuthLayout", () => {
  it("スロットコンテンツが描画される", async () => {
    const wrapper = await mountSuspended(AuthLayout, {
      slots: { default: "<p class='test-content'>テストコンテンツ</p>" },
    });
    expect(wrapper.find("p.test-content").exists()).toBe(true);
    expect(wrapper.find("p.test-content").text()).toBe("テストコンテンツ");
  });

  it("div でラップされている", async () => {
    const wrapper = await mountSuspended(AuthLayout, {
      slots: { default: "内容" },
    });
    expect(wrapper.find("div").exists()).toBe(true);
  });
});
