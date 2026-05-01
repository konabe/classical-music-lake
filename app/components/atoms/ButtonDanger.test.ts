import { mountSuspended } from "@nuxt/test-utils/runtime";
import ButtonDanger from "./ButtonDanger.vue";

describe("ButtonDanger", () => {
  describe("表示", () => {
    it("スロットのテキストが描画される", async () => {
      const wrapper = await mountSuspended(ButtonDanger, {
        slots: { default: "削除" },
      });
      expect(wrapper.text()).toBe("削除");
    });

    it("btn-danger クラスが付いている", async () => {
      const wrapper = await mountSuspended(ButtonDanger, {
        slots: { default: "削除" },
      });
      expect(wrapper.find("button.btn-danger").exists()).toBe(true);
    });
  });

  describe("props による挙動の変化", () => {
    it("type は常に button 固定", async () => {
      const wrapper = await mountSuspended(ButtonDanger, {
        slots: { default: "削除" },
      });
      expect(wrapper.find("button").attributes("type")).toBe("button");
    });

    it("disabled=true のとき button に disabled 属性が付く", async () => {
      const wrapper = await mountSuspended(ButtonDanger, {
        props: { disabled: true },
        slots: { default: "処理中..." },
      });
      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });

    it("disabled=false のとき disabled 属性が付かない", async () => {
      const wrapper = await mountSuspended(ButtonDanger, {
        props: { disabled: false },
        slots: { default: "削除" },
      });
      expect(wrapper.find("button").attributes("disabled")).toBeUndefined();
    });
  });

  describe("イベント", () => {
    it("クリックで親に渡された onClick が呼ばれる", async () => {
      const onClick = vi.fn();
      const wrapper = await mountSuspended(ButtonDanger, {
        slots: { default: "削除" },
        attrs: { onClick },
      });
      await wrapper.find("button").trigger("click");
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
