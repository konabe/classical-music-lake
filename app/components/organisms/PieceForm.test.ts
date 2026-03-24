import { mountSuspended } from "@nuxt/test-utils/runtime";
import PieceForm from "./PieceForm.vue";
import ButtonPrimary from "../atoms/ButtonPrimary.vue";

describe("PieceForm", () => {
  describe("デフォルト値でのレンダリング", () => {
    it("フォームが表示される", async () => {
      const wrapper = await mountSuspended(PieceForm);
      expect(wrapper.find("form.piece-form").exists()).toBe(true);
    });

    it("送信ラベルのデフォルトは「保存する」", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        global: { components: { ButtonPrimary } },
      });
      expect(wrapper.find("button[type='submit']").text()).toBe("保存する");
    });

    it("曲名・作曲家の入力フィールドが空である", async () => {
      const wrapper = await mountSuspended(PieceForm);
      const titleInput = wrapper.find("#title");
      const composerInput = wrapper.find("#composer");
      expect((titleInput.element as HTMLInputElement).value).toBe("");
      expect((composerInput.element as HTMLInputElement).value).toBe("");
    });
  });

  describe("initialValues での初期化", () => {
    it("初期値が入力フィールドに反映される", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          initialValues: { title: "交響曲第9番", composer: "ベートーヴェン" },
        },
      });

      const titleInput = wrapper.find("#title");
      const composerInput = wrapper.find("#composer");
      expect((titleInput.element as HTMLInputElement).value).toBe("交響曲第9番");
      expect((composerInput.element as HTMLInputElement).value).toBe("ベートーヴェン");
    });

    it("一部の初期値のみ指定できる", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: { initialValues: { title: "魔笛" } },
      });

      const titleInput = wrapper.find("#title");
      const composerInput = wrapper.find("#composer");
      expect((titleInput.element as HTMLInputElement).value).toBe("魔笛");
      expect((composerInput.element as HTMLInputElement).value).toBe("");
    });
  });

  describe("submitLabel prop", () => {
    it("カスタムラベルが反映される", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: { submitLabel: "登録する" },
        global: { components: { ButtonPrimary } },
      });
      expect(wrapper.find("button[type='submit']").text()).toBe("登録する");
    });
  });

  describe("フォーム送信", () => {
    it("フォーム送信時に submit イベントが emit される", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          initialValues: { title: "交響曲第9番", composer: "ベートーヴェン" },
        },
      });

      await wrapper.find("form").trigger("submit.prevent");
      expect(wrapper.emitted("submit")).toBeTruthy();
    });

    it("submit イベントにフォームデータが含まれる", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          initialValues: { title: "交響曲第9番", composer: "ベートーヴェン" },
        },
      });

      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit");
      expect(emitted).toBeTruthy();
      const emittedData = emitted![0][0] as Record<string, unknown>;
      expect(emittedData.title).toBe("交響曲第9番");
      expect(emittedData.composer).toBe("ベートーヴェン");
    });
  });
});
