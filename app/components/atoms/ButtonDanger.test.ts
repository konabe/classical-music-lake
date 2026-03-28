import { mountSuspended } from "@nuxt/test-utils/runtime";
import ButtonDanger from "./ButtonDanger.vue";

describe("ButtonDanger", () => {
  describe("表示", () => {
    it("label が表示される", async () => {
      const wrapper = await mountSuspended(ButtonDanger, {
        props: { label: "削除" },
      });
      expect(wrapper.text()).toBe("削除");
    });

    it("btn-danger クラスが付いている", async () => {
      const wrapper = await mountSuspended(ButtonDanger, {
        props: { label: "削除" },
      });
      expect(wrapper.find("button.btn-danger").exists()).toBe(true);
    });

    it("type は button", async () => {
      const wrapper = await mountSuspended(ButtonDanger, {
        props: { label: "削除" },
      });
      expect(wrapper.find("button").attributes("type")).toBe("button");
    });
  });

  describe("イベント", () => {
    it("クリック時に click イベントが emit される", async () => {
      const wrapper = await mountSuspended(ButtonDanger, {
        props: { label: "削除" },
      });
      await wrapper.find("button").trigger("click");
      expect(wrapper.emitted("click")).toBeDefined();
      expect(wrapper.emitted("click")).toHaveLength(1);
    });
  });
});
