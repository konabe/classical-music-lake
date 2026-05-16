import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import AuthLayout from "@/layouts/auth.vue";

const colorModeState = reactive({
  preference: "light",
  value: "light",
  unknown: false,
});

mockNuxtImport("useColorMode", () => () => colorModeState);

describe("AuthLayout", () => {
  it("スロットコンテンツが描画される", async () => {
    const wrapper = await mountSuspended(AuthLayout, {
      slots: { default: "<p class='test-content'>テストコンテンツ</p>" },
    });
    expect(wrapper.find("p.test-content").exists()).toBe(true);
    expect(wrapper.find("p.test-content").text()).toBe("テストコンテンツ");
  });

  it("ヘッダーにホームへのロゴリンクが表示される", async () => {
    const wrapper = await mountSuspended(AuthLayout, {
      slots: { default: "内容" },
    });
    const logo = wrapper.find("a.logo");
    expect(logo.exists()).toBe(true);
    expect(logo.attributes("href")).toBe("/");
  });

  it("ロゴのアクセシブル名が設定されている", async () => {
    const wrapper = await mountSuspended(AuthLayout, {
      slots: { default: "内容" },
    });
    expect(wrapper.find("a.logo").attributes("aria-label")).toBe("ホームに戻る");
  });
});
