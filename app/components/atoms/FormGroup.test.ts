import { mountSuspended } from "@nuxt/test-utils/runtime";
import FormGroup from "./FormGroup.vue";

describe("FormGroup", () => {
  describe("表示", () => {
    it("label テキストが表示される", async () => {
      const wrapper = await mountSuspended(FormGroup, {
        props: { label: "メールアドレス" },
      });
      expect(wrapper.find("label").text()).toContain("メールアドレス");
    });

    it("inputId が label の for 属性に反映される", async () => {
      const wrapper = await mountSuspended(FormGroup, {
        props: { label: "メール", inputId: "email" },
      });
      expect(wrapper.find("label").attributes("for")).toBe("email");
    });

    it("スロットコンテンツが描画される", async () => {
      const wrapper = await mountSuspended(FormGroup, {
        props: { label: "名前" },
        slots: { default: '<input id="name" />' },
      });
      expect(wrapper.find("input#name").exists()).toBe(true);
    });

    it("required=true のとき RequiredMark が表示される", async () => {
      const wrapper = await mountSuspended(FormGroup, {
        props: { label: "名前", required: true },
      });
      expect(wrapper.findComponent({ name: "RequiredMark" }).exists()).toBe(true);
    });

    it("required が未設定のとき RequiredMark が表示されない", async () => {
      const wrapper = await mountSuspended(FormGroup, {
        props: { label: "名前" },
      });
      expect(wrapper.findComponent({ name: "RequiredMark" }).exists()).toBe(false);
    });

    it("errorMessage が設定されているとき ErrorMessage が表示される", async () => {
      const wrapper = await mountSuspended(FormGroup, {
        props: { label: "名前", errorMessage: "必須項目です" },
      });
      expect(wrapper.findComponent({ name: "ErrorMessage" }).exists()).toBe(true);
    });

    it("errorMessage が未設定のとき ErrorMessage が表示されない", async () => {
      const wrapper = await mountSuspended(FormGroup, {
        props: { label: "名前" },
      });
      expect(wrapper.findComponent({ name: "ErrorMessage" }).exists()).toBe(false);
    });
  });
});
