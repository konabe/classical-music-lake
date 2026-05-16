import { mountSuspended } from "@nuxt/test-utils/runtime";
import ButtonPrimary from "@/components/atoms/ButtonPrimary.vue";

describe("ButtonPrimary", () => {
  describe("表示", () => {
    it("スロットのテキストが描画される", async () => {
      const wrapper = await mountSuspended(ButtonPrimary, {
        slots: { default: "保存する" },
      });
      expect(wrapper.text()).toBe("保存する");
    });

    it("btn-primary クラスが付いている", async () => {
      const wrapper = await mountSuspended(ButtonPrimary, {
        slots: { default: "保存する" },
      });
      expect(wrapper.find("button.btn-primary").exists()).toBe(true);
    });
  });

  describe("props による挙動の変化", () => {
    it("デフォルトの type は button", async () => {
      const wrapper = await mountSuspended(ButtonPrimary, {
        slots: { default: "ボタン" },
      });
      expect(wrapper.find("button").attributes("type")).toBe("button");
    });

    it("type=submit を渡せる", async () => {
      const wrapper = await mountSuspended(ButtonPrimary, {
        props: { type: "submit" },
        slots: { default: "送信" },
      });
      expect(wrapper.find("button").attributes("type")).toBe("submit");
    });

    it("disabled=true のとき button に disabled 属性が付く", async () => {
      const wrapper = await mountSuspended(ButtonPrimary, {
        props: { disabled: true },
        slots: { default: "ログイン中..." },
      });
      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });

    it("disabled=false のとき disabled 属性が付かない", async () => {
      const wrapper = await mountSuspended(ButtonPrimary, {
        props: { disabled: false },
        slots: { default: "ログイン" },
      });
      expect(wrapper.find("button").attributes("disabled")).toBeUndefined();
    });
  });

  describe("イベント", () => {
    it("クリックで親に渡された onClick が呼ばれる", async () => {
      const onClick = vi.fn();
      const wrapper = await mountSuspended(ButtonPrimary, {
        slots: { default: "保存する" },
        attrs: { onClick },
      });
      await wrapper.find("button").trigger("click");
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
