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

    it("曲名・作曲家・動画 URL の入力フィールドが空である", async () => {
      const wrapper = await mountSuspended(PieceForm);
      const titleInput = wrapper.find("#title");
      const composerInput = wrapper.find("#composer");
      const videoUrlInput = wrapper.find("#videoUrl");
      expect((titleInput.element as HTMLInputElement).value).toBe("");
      expect((composerInput.element as HTMLInputElement).value).toBe("");
      expect((videoUrlInput.element as HTMLInputElement).value).toBe("");
    });

    it("動画 URL 入力フィールドが表示される", async () => {
      const wrapper = await mountSuspended(PieceForm);
      expect(wrapper.find("#videoUrl").exists()).toBe(true);
    });
  });

  describe("initialValues での初期化", () => {
    it("初期値が入力フィールドに反映される", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          initialValues: {
            title: "交響曲第9番",
            composer: "ベートーヴェン",
            videoUrl: "https://www.youtube.com/watch?v=abc",
          },
        },
      });

      const titleInput = wrapper.find("#title");
      const composerInput = wrapper.find("#composer");
      const videoUrlInput = wrapper.find("#videoUrl");
      expect((titleInput.element as HTMLInputElement).value).toBe("交響曲第9番");
      expect((composerInput.element as HTMLInputElement).value).toBe("ベートーヴェン");
      expect((videoUrlInput.element as HTMLInputElement).value).toBe(
        "https://www.youtube.com/watch?v=abc"
      );
    });

    it("一部の初期値のみ指定できる", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: { initialValues: { title: "魔笛" } },
      });

      const titleInput = wrapper.find("#title");
      const composerInput = wrapper.find("#composer");
      const videoUrlInput = wrapper.find("#videoUrl");
      expect((titleInput.element as HTMLInputElement).value).toBe("魔笛");
      expect((composerInput.element as HTMLInputElement).value).toBe("");
      expect((videoUrlInput.element as HTMLInputElement).value).toBe("");
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

  describe("カテゴリ選択フィールド", () => {
    it("4つのカテゴリ選択フィールドが表示される", async () => {
      const wrapper = await mountSuspended(PieceForm);
      expect(wrapper.find("#genre").exists()).toBe(true);
      expect(wrapper.find("#era").exists()).toBe(true);
      expect(wrapper.find("#formation").exists()).toBe(true);
      expect(wrapper.find("#region").exists()).toBe(true);
    });

    it("カテゴリの初期値が反映される", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          initialValues: {
            title: "交響曲第9番",
            composer: "ベートーヴェン",
            genre: "交響曲",
            era: "古典派",
            formation: "管弦楽",
            region: "ドイツ・オーストリア",
          },
        },
      });
      expect((wrapper.find("#genre").element as HTMLSelectElement).value).toBe("交響曲");
      expect((wrapper.find("#era").element as HTMLSelectElement).value).toBe("古典派");
      expect((wrapper.find("#formation").element as HTMLSelectElement).value).toBe("管弦楽");
      expect((wrapper.find("#region").element as HTMLSelectElement).value).toBe(
        "ドイツ・オーストリア"
      );
    });

    it("カテゴリ未指定時はデフォルト（空）のまま", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          initialValues: { title: "魔笛", composer: "モーツァルト" },
        },
      });
      expect((wrapper.find("#genre").element as HTMLSelectElement).value).toBe("");
      expect((wrapper.find("#era").element as HTMLSelectElement).value).toBe("");
      expect((wrapper.find("#formation").element as HTMLSelectElement).value).toBe("");
      expect((wrapper.find("#region").element as HTMLSelectElement).value).toBe("");
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
      expect(wrapper.emitted("submit")).toBeDefined();
    });

    it("submit イベントにフォームデータが含まれる", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          initialValues: {
            title: "交響曲第9番",
            composer: "ベートーヴェン",
            videoUrl: "https://www.youtube.com/watch?v=abc",
          },
        },
      });

      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit");
      expect(emitted).toBeDefined();
      const emittedData = emitted![0][0] as Record<string, unknown>;
      expect(emittedData.title).toBe("交響曲第9番");
      expect(emittedData.composer).toBe("ベートーヴェン");
      expect(emittedData.videoUrl).toBe("https://www.youtube.com/watch?v=abc");
    });

    it("カテゴリ付きのフォームデータが submit イベントに含まれる", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          initialValues: {
            title: "交響曲第9番",
            composer: "ベートーヴェン",
            genre: "交響曲",
            era: "古典派",
            formation: "管弦楽",
            region: "ドイツ・オーストリア",
          },
        },
      });

      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit");
      expect(emitted).toBeDefined();
      const emittedData = emitted![0][0] as Record<string, unknown>;
      expect(emittedData.genre).toBe("交響曲");
      expect(emittedData.era).toBe("古典派");
      expect(emittedData.formation).toBe("管弦楽");
      expect(emittedData.region).toBe("ドイツ・オーストリア");
    });

    it("未選択のカテゴリは undefined として送信される", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          initialValues: { title: "魔笛", composer: "モーツァルト" },
        },
      });

      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit");
      const emittedData = emitted![0][0] as Record<string, unknown>;
      expect(emittedData.genre).toBeUndefined();
      expect(emittedData.era).toBeUndefined();
      expect(emittedData.formation).toBeUndefined();
      expect(emittedData.region).toBeUndefined();
    });
  });
});
