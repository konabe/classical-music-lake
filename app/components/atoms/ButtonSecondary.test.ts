import { mountSuspended } from "@nuxt/test-utils/runtime";
import ButtonSecondary from "./ButtonSecondary.vue";

describe("ButtonSecondary", () => {
  describe("表示", () => {
    it("スロットのテキストが描画される", async () => {
      const wrapper = await mountSuspended(ButtonSecondary, {
        slots: { default: "戻る" },
      });
      expect(wrapper.text()).toBe("戻る");
    });

    it("btn-secondary クラスが付いている", async () => {
      const wrapper = await mountSuspended(ButtonSecondary, {
        slots: { default: "戻る" },
      });
      expect(wrapper.find("button.btn-secondary").exists()).toBe(true);
    });
  });

  describe("props による挙動の変化", () => {
    it("デフォルトの type は button", async () => {
      const wrapper = await mountSuspended(ButtonSecondary, {
        slots: { default: "戻る" },
      });
      expect(wrapper.find("button").attributes("type")).toBe("button");
    });

    it("type=submit を渡せる", async () => {
      const wrapper = await mountSuspended(ButtonSecondary, {
        props: { type: "submit" },
        slots: { default: "送信" },
      });
      expect(wrapper.find("button").attributes("type")).toBe("submit");
    });

    it("disabled=true のとき button に disabled 属性が付く", async () => {
      const wrapper = await mountSuspended(ButtonSecondary, {
        props: { disabled: true },
        slots: { default: "処理中..." },
      });
      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });

    it("disabled=false のとき disabled 属性が付かない", async () => {
      const wrapper = await mountSuspended(ButtonSecondary, {
        props: { disabled: false },
        slots: { default: "戻る" },
      });
      expect(wrapper.find("button").attributes("disabled")).toBeUndefined();
    });
  });

  describe("イベント", () => {
    it("クリックで親に渡された onClick が呼ばれる", async () => {
      const onClick = vi.fn();
      const wrapper = await mountSuspended(ButtonSecondary, {
        slots: { default: "戻る" },
        attrs: { onClick },
      });
      await wrapper.find("button").trigger("click");
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
