import { mountSuspended } from "@nuxt/test-utils/runtime";
import ButtonSecondary from "./ButtonSecondary.vue";

describe("ButtonSecondary", () => {
  describe("表示", () => {
    it("label が表示される", async () => {
      const wrapper = await mountSuspended(ButtonSecondary, {
        props: { label: "戻る" },
      });
      expect(wrapper.text()).toBe("戻る");
    });

    it("btn-secondary クラスが付いている", async () => {
      const wrapper = await mountSuspended(ButtonSecondary, {
        props: { label: "戻る" },
      });
      expect(wrapper.find("button.btn-secondary").exists()).toBe(true);
    });

    it("type は button", async () => {
      const wrapper = await mountSuspended(ButtonSecondary, {
        props: { label: "戻る" },
      });
      expect(wrapper.find("button").attributes("type")).toBe("button");
    });
  });

  describe("イベント", () => {
    it("クリック時に click イベントが emit される", async () => {
      const wrapper = await mountSuspended(ButtonSecondary, {
        props: { label: "戻る" },
      });
      await wrapper.find("button").trigger("click");
      expect(wrapper.emitted("click")).toBeDefined();
      expect(wrapper.emitted("click")).toHaveLength(1);
    });
  });
});
