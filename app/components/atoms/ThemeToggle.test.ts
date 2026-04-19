import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import ThemeToggle from "./ThemeToggle.vue";

const colorModeState = reactive({
  preference: "light",
  value: "light",
  unknown: false,
});

mockNuxtImport("useColorMode", () => () => colorModeState);

describe("ThemeToggle", () => {
  beforeEach(() => {
    colorModeState.preference = "light";
    colorModeState.value = "light";
  });

  describe("表示", () => {
    it("button 要素が描画される", async () => {
      const wrapper = await mountSuspended(ThemeToggle);
      expect(wrapper.find("button.theme-toggle").exists()).toBe(true);
    });

    it("aria-pressed 属性を持つ", async () => {
      const wrapper = await mountSuspended(ThemeToggle);
      expect(wrapper.find("button").attributes("aria-pressed")).toBeDefined();
    });

    it("ライトモード時の aria-label は「ダークモードに切り替え」", async () => {
      const wrapper = await mountSuspended(ThemeToggle);
      expect(wrapper.find("button").attributes("aria-label")).toBe("ダークモードに切り替え");
    });

    it("ダークモード時の aria-label は「ライトモードに切り替え」", async () => {
      colorModeState.value = "dark";
      const wrapper = await mountSuspended(ThemeToggle);
      expect(wrapper.find("button").attributes("aria-label")).toBe("ライトモードに切り替え");
    });
  });

  describe("イベント", () => {
    it("クリックで preference がライト→ダークに切り替わる", async () => {
      const wrapper = await mountSuspended(ThemeToggle);
      await wrapper.find("button").trigger("click");
      expect(colorModeState.preference).toBe("dark");
    });

    it("クリックで preference がダーク→ライトに切り替わる", async () => {
      colorModeState.value = "dark";
      const wrapper = await mountSuspended(ThemeToggle);
      await wrapper.find("button").trigger("click");
      expect(colorModeState.preference).toBe("light");
    });
  });
});
