import { mountSuspended } from "@nuxt/test-utils/runtime";
import QuickLogForm from "@/components/organisms/QuickLogForm.vue";
import ButtonPrimary from "@/components/atoms/ButtonPrimary.vue";

const defaultProps = { composer: "ベートーヴェン", piece: "交響曲第9番 ニ短調" };

describe("QuickLogForm", () => {
  describe("表示", () => {
    it("作曲家が表示される", async () => {
      const wrapper = await mountSuspended(QuickLogForm, { props: defaultProps });
      expect(wrapper.text()).toContain("ベートーヴェン");
    });

    it("曲名が表示される", async () => {
      const wrapper = await mountSuspended(QuickLogForm, { props: defaultProps });
      expect(wrapper.text()).toContain("交響曲第9番 ニ短調");
    });

    it("評価セレクターが表示される", async () => {
      const wrapper = await mountSuspended(QuickLogForm, { props: defaultProps });
      expect(wrapper.find(".rating-selector").exists()).toBe(true);
    });

    it("お気に入りチェックボックスが表示される", async () => {
      const wrapper = await mountSuspended(QuickLogForm, { props: defaultProps });
      expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
    });

    it("感想・メモのテキストエリアが表示される", async () => {
      const wrapper = await mountSuspended(QuickLogForm, { props: defaultProps });
      expect(wrapper.find("textarea").exists()).toBe(true);
    });

    it("「記録する」ボタンが表示される", async () => {
      const wrapper = await mountSuspended(QuickLogForm, {
        props: defaultProps,
        global: { components: { ButtonPrimary } },
      });
      expect(wrapper.find("button[type='submit']").text()).toBe("記録する");
    });
  });

  describe("submit イベント", () => {
    it("フォーム送信時に submit イベントが emit される", async () => {
      const wrapper = await mountSuspended(QuickLogForm, { props: defaultProps });
      await wrapper.find("form").trigger("submit.prevent");
      expect(wrapper.emitted("submit")).toBeDefined();
    });

    it("submit イベントに rating, isFavorite, memo が含まれる", async () => {
      const wrapper = await mountSuspended(QuickLogForm, { props: defaultProps });
      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit");
      expect(emitted).toBeDefined();
      const payload = emitted![0][0] as Record<string, unknown>;
      expect(payload).toHaveProperty("rating");
      expect(payload).toHaveProperty("isFavorite");
      expect(payload).toHaveProperty("memo");
    });
  });

  describe("保存後のリセット", () => {
    it("保存後にメモがリセットされる", async () => {
      const wrapper = await mountSuspended(QuickLogForm, { props: defaultProps });
      const textarea = wrapper.find("textarea");
      await textarea.setValue("素晴らしい演奏でした");
      await wrapper.find("form").trigger("submit.prevent");
      expect((textarea.element as HTMLTextAreaElement).value).toBe("");
    });

    it("保存後に完了メッセージが表示される", async () => {
      const wrapper = await mountSuspended(QuickLogForm, {
        props: defaultProps,
        global: { components: { ButtonPrimary } },
      });
      await wrapper.find("form").trigger("submit.prevent");
      expect(wrapper.text()).toContain("保存しました");
    });
  });
});
