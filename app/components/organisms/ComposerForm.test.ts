import { mountSuspended } from "@nuxt/test-utils/runtime";
import ComposerForm from "@/components/organisms/ComposerForm.vue";
import ButtonPrimary from "@/components/atoms/ButtonPrimary.vue";

describe("ComposerForm", () => {
  describe("デフォルト値でのレンダリング", () => {
    it("フォームが表示される", async () => {
      const wrapper = await mountSuspended(ComposerForm);
      expect(wrapper.find("form.composer-form").exists()).toBe(true);
    });

    it("作曲家名の入力フィールドが空である", async () => {
      const wrapper = await mountSuspended(ComposerForm);
      const nameInput = wrapper.find("#name");
      expect((nameInput.element as HTMLInputElement).value).toBe("");
    });
  });

  describe("initialValues での初期化", () => {
    it("初期値が入力フィールドに反映される", async () => {
      const wrapper = await mountSuspended(ComposerForm, {
        props: {
          initialValues: {
            name: "ベートーヴェン",
            era: "古典派",
            region: "ドイツ・オーストリア",
          },
        },
      });

      const nameInput = wrapper.find("#name");
      expect((nameInput.element as HTMLInputElement).value).toBe("ベートーヴェン");
      expect((wrapper.find("#era").element as HTMLSelectElement).value).toBe("古典派");
      expect((wrapper.find("#region").element as HTMLSelectElement).value).toBe(
        "ドイツ・オーストリア",
      );
    });
  });

  describe("submitLabel prop", () => {
    it("カスタムラベルが反映される", async () => {
      const wrapper = await mountSuspended(ComposerForm, {
        props: { submitLabel: "登録する" },
        global: { components: { ButtonPrimary } },
      });
      expect(wrapper.find("button[type='submit']").text()).toBe("登録する");
    });
  });

  describe("フォーム送信", () => {
    it("フォーム送信時に submit イベントが emit される", async () => {
      const wrapper = await mountSuspended(ComposerForm, {
        props: { initialValues: { name: "ベートーヴェン" } },
      });
      await wrapper.find("form").trigger("submit.prevent");
      expect(wrapper.emitted("submit")).toBeDefined();
    });

    it("submit イベントにフォームデータが含まれる", async () => {
      const wrapper = await mountSuspended(ComposerForm, {
        props: {
          initialValues: { name: "ベートーヴェン", era: "古典派" },
        },
      });
      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit");
      expect(emitted).toBeDefined();
      const emittedData = emitted![0][0] as Record<string, unknown>;
      expect(emittedData.name).toBe("ベートーヴェン");
      expect(emittedData.era).toBe("古典派");
    });

    it("未選択のカテゴリは undefined として送信される", async () => {
      const wrapper = await mountSuspended(ComposerForm, {
        props: { initialValues: { name: "モーツァルト" } },
      });
      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit");
      const emittedData = emitted![0][0] as Record<string, unknown>;
      expect(emittedData.era).toBeUndefined();
      expect(emittedData.region).toBeUndefined();
    });
  });

  describe("生年・没年", () => {
    it("初期値が input に反映される", async () => {
      const wrapper = await mountSuspended(ComposerForm, {
        props: {
          initialValues: { name: "ベートーヴェン", birthYear: 1770, deathYear: 1827 },
        },
      });
      expect((wrapper.find("#birth-year").element as HTMLInputElement).value).toBe("1770");
      expect((wrapper.find("#death-year").element as HTMLInputElement).value).toBe("1827");
    });

    it("入力した生年・没年が submit に number として含まれる", async () => {
      const wrapper = await mountSuspended(ComposerForm, {
        props: {
          initialValues: { name: "ベートーヴェン", birthYear: 1770, deathYear: 1827 },
        },
      });
      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit");
      const emittedData = emitted![0][0] as Record<string, unknown>;
      expect(emittedData.birthYear).toBe(1770);
      expect(emittedData.deathYear).toBe(1827);
    });

    it("未入力の生年・没年は undefined として送信される", async () => {
      const wrapper = await mountSuspended(ComposerForm, {
        props: { initialValues: { name: "ベートーヴェン" } },
      });
      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit");
      const emittedData = emitted![0][0] as Record<string, unknown>;
      expect(emittedData.birthYear).toBeUndefined();
      expect(emittedData.deathYear).toBeUndefined();
    });
  });
});
