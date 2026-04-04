import { mountSuspended } from "@nuxt/test-utils/runtime";
import ConcertLogForm from "./ConcertLogForm.vue";

describe("ConcertLogForm", () => {
  describe("表示", () => {
    it("会場入力欄が表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogForm);
      expect(wrapper.find('input[placeholder="例: サントリーホール"]').exists()).toBe(true);
    });

    it("submitLabel が反映される", async () => {
      const wrapper = await mountSuspended(ConcertLogForm, {
        props: { submitLabel: "保存する" },
      });
      expect(wrapper.text()).toContain("保存する");
    });
  });

  describe("イベント", () => {
    it("フォームを送信すると submit イベントが emit される", async () => {
      const wrapper = await mountSuspended(ConcertLogForm);
      await wrapper.find('input[type="datetime-local"]').setValue("2024-03-01T19:00");
      await wrapper.find('input[placeholder="例: サントリーホール"]').setValue("サントリーホール");
      await wrapper.find("form").trigger("submit");
      expect(wrapper.emitted("submit")).toBeDefined();
    });
  });
});
