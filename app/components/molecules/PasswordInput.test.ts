import { mountSuspended } from "@nuxt/test-utils/runtime";
import PasswordInput from "./PasswordInput.vue";

describe("PasswordInput", () => {
  describe("表示", () => {
    it("初期状態では type=password になっている", async () => {
      const wrapper = await mountSuspended(PasswordInput, {
        props: { modelValue: "" },
      });
      expect(wrapper.find("input").attributes("type")).toBe("password");
    });

    it("トグルボタンが表示される", async () => {
      const wrapper = await mountSuspended(PasswordInput, {
        props: { modelValue: "" },
      });
      expect(wrapper.find("button.toggle-button").exists()).toBe(true);
    });

    it("初期状態のトグルボタンの aria-label は「パスワードを表示」", async () => {
      const wrapper = await mountSuspended(PasswordInput, {
        props: { modelValue: "" },
      });
      expect(wrapper.find("button.toggle-button").attributes("aria-label")).toBe(
        "パスワードを表示"
      );
    });

    it("modelValue が input に反映される", async () => {
      const wrapper = await mountSuspended(PasswordInput, {
        props: { modelValue: "secret" },
      });
      expect(wrapper.find("input").element.value).toBe("secret");
    });

    it("placeholder が input に渡される", async () => {
      const wrapper = await mountSuspended(PasswordInput, {
        props: { modelValue: "", placeholder: "パスワードを入力" },
      });
      expect(wrapper.find("input").attributes("placeholder")).toBe("パスワードを入力");
    });
  });

  describe("イベント", () => {
    it("入力時に update:modelValue が emit される", async () => {
      const wrapper = await mountSuspended(PasswordInput, {
        props: { modelValue: "" },
      });
      await wrapper.find("input").setValue("newpass");
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["newpass"]);
    });

    it("トグルボタンをクリックすると type が text に切り替わる", async () => {
      const wrapper = await mountSuspended(PasswordInput, {
        props: { modelValue: "secret" },
      });
      await wrapper.find("button.toggle-button").trigger("click");
      expect(wrapper.find("input").attributes("type")).toBe("text");
    });

    it("トグルボタンをクリックすると aria-label が「パスワードを非表示」になる", async () => {
      const wrapper = await mountSuspended(PasswordInput, {
        props: { modelValue: "" },
      });
      await wrapper.find("button.toggle-button").trigger("click");
      expect(wrapper.find("button.toggle-button").attributes("aria-label")).toBe(
        "パスワードを非表示"
      );
    });

    it("再度クリックすると type が password に戻る", async () => {
      const wrapper = await mountSuspended(PasswordInput, {
        props: { modelValue: "" },
      });
      await wrapper.find("button.toggle-button").trigger("click");
      await wrapper.find("button.toggle-button").trigger("click");
      expect(wrapper.find("input").attributes("type")).toBe("password");
    });

    it("トグルボタンの type は button（form を submit しない）", async () => {
      const wrapper = await mountSuspended(PasswordInput, {
        props: { modelValue: "" },
      });
      expect(wrapper.find("button.toggle-button").attributes("type")).toBe("button");
    });
  });
});
