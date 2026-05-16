import { mountSuspended } from "@nuxt/test-utils/runtime";
import FormActions from "@/components/molecules/FormActions.vue";
import ButtonPrimary from "@/components/atoms/ButtonPrimary.vue";
import ButtonSecondary from "@/components/atoms/ButtonSecondary.vue";

const globalComponents = { global: { components: { ButtonPrimary, ButtonSecondary } } };

describe("FormActions", () => {
  describe("表示", () => {
    it("キャンセルボタンが表示される", async () => {
      const wrapper = await mountSuspended(FormActions, globalComponents);
      const buttons = wrapper.findAll("button");
      const cancelButton = buttons.find((b) => b.text() === "Cancel");
      expect(cancelButton).toBeDefined();
    });

    it("デフォルトの保存ボタンラベルは「保存する」", async () => {
      const wrapper = await mountSuspended(FormActions, globalComponents);
      expect(wrapper.find("button[type='submit']").text()).toBe("保存する");
    });

    it("submitLabel を渡すと保存ボタンのラベルに反映される", async () => {
      const wrapper = await mountSuspended(FormActions, {
        props: { submitLabel: "記録する" },
        ...globalComponents,
      });
      expect(wrapper.find("button[type='submit']").text()).toBe("記録する");
    });

    it("form-actions クラスが存在する", async () => {
      const wrapper = await mountSuspended(FormActions, globalComponents);
      expect(wrapper.find(".form-actions").exists()).toBe(true);
    });
  });

  describe("isSubmitting", () => {
    it("isSubmitting が false のとき保存ボタンが有効", async () => {
      const wrapper = await mountSuspended(FormActions, {
        props: { isSubmitting: false },
        ...globalComponents,
      });
      expect(wrapper.find("button[type='submit']").attributes("disabled")).toBeUndefined();
    });

    it("isSubmitting が true のとき保存ボタンが disabled になる", async () => {
      const wrapper = await mountSuspended(FormActions, {
        props: { isSubmitting: true },
        ...globalComponents,
      });
      expect(wrapper.find("button[type='submit']").attributes("disabled")).toBeDefined();
    });
  });

  describe("イベント", () => {
    it("キャンセルボタンクリックで cancel イベントが emit される", async () => {
      const wrapper = await mountSuspended(FormActions, globalComponents);
      const buttons = wrapper.findAll("button");
      const cancelButton = buttons.find((b) => b.text() === "Cancel");
      await cancelButton?.trigger("click");
      expect(wrapper.emitted("cancel")).toBeDefined();
    });
  });
});
