import { mountSuspended } from "@nuxt/test-utils/runtime";
import PieceForm from "./PieceForm.vue";
import ButtonPrimary from "../atoms/ButtonPrimary.vue";
import type { Composer } from "~/types";

const COMPOSER_ID_BEETHOVEN = "00000000-0000-4000-8000-000000000001";
const COMPOSER_ID_MOZART = "00000000-0000-4000-8000-000000000002";

const mockComposers: Composer[] = [
  {
    id: COMPOSER_ID_BEETHOVEN,
    name: "ベートーヴェン",
    createdAt: "2024-06-01T09:00:00.000Z",
    updatedAt: "2024-06-01T09:00:00.000Z",
  },
  {
    id: COMPOSER_ID_MOZART,
    name: "モーツァルト",
    createdAt: "2024-06-01T09:00:00.000Z",
    updatedAt: "2024-06-01T09:00:00.000Z",
  },
];

describe("PieceForm", () => {
  describe("デフォルト値でのレンダリング", () => {
    it("フォームが表示される", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: { composers: mockComposers },
      });
      expect(wrapper.find("form.piece-form").exists()).toBe(true);
    });

    it("送信ラベルのデフォルトは「保存する」", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: { composers: mockComposers },
        global: { components: { ButtonPrimary } },
      });
      expect(wrapper.find("button[type='submit']").text()).toBe("保存する");
    });

    it("曲名・作曲家セレクト・動画 URL の入力フィールドが空である", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: { composers: mockComposers },
      });
      const titleInput = wrapper.find("#title");
      const composerSelect = wrapper.find("#composerId");
      const videoUrlInput = wrapper.find("#videoUrls-0");
      expect((titleInput.element as HTMLInputElement).value).toBe("");
      expect((composerSelect.element as HTMLSelectElement).value).toBe("");
      expect((videoUrlInput.element as HTMLInputElement).value).toBe("");
    });

    it("動画 URL 入力フィールドが少なくとも 1 つ表示される", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: { composers: mockComposers },
      });
      expect(wrapper.find("#videoUrls-0").exists()).toBe(true);
    });

    it("composers から作曲家セレクトのオプションが生成される", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: { composers: mockComposers },
      });
      const options = wrapper.findAll("#composerId option");
      // 先頭はプレースホルダ（value=""）
      expect(options.length).toBe(1 + mockComposers.length);
      expect(options[1].text()).toBe("ベートーヴェン");
      expect(options[2].text()).toBe("モーツァルト");
    });
  });

  describe("initialValues での初期化", () => {
    it("初期値が入力フィールドに反映される", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          composers: mockComposers,
          initialValues: {
            title: "交響曲第9番",
            composerId: COMPOSER_ID_BEETHOVEN,
            videoUrls: ["https://www.youtube.com/watch?v=abc"],
          },
        },
      });

      const titleInput = wrapper.find("#title");
      const composerSelect = wrapper.find("#composerId");
      const videoUrlInput = wrapper.find("#videoUrls-0");
      expect((titleInput.element as HTMLInputElement).value).toBe("交響曲第9番");
      expect((composerSelect.element as HTMLSelectElement).value).toBe(COMPOSER_ID_BEETHOVEN);
      expect((videoUrlInput.element as HTMLInputElement).value).toBe(
        "https://www.youtube.com/watch?v=abc",
      );
    });

    it("複数の videoUrls が初期値として展開される", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          composers: mockComposers,
          initialValues: {
            title: "交響曲第9番",
            composerId: COMPOSER_ID_BEETHOVEN,
            videoUrls: [
              "https://www.youtube.com/watch?v=abc",
              "https://www.youtube.com/watch?v=def",
            ],
          },
        },
      });

      expect((wrapper.find("#videoUrls-0").element as HTMLInputElement).value).toBe(
        "https://www.youtube.com/watch?v=abc",
      );
      expect((wrapper.find("#videoUrls-1").element as HTMLInputElement).value).toBe(
        "https://www.youtube.com/watch?v=def",
      );
    });

    it("一部の初期値のみ指定できる", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: { composers: mockComposers, initialValues: { title: "魔笛" } },
      });

      const titleInput = wrapper.find("#title");
      const composerSelect = wrapper.find("#composerId");
      const videoUrlInput = wrapper.find("#videoUrls-0");
      expect((titleInput.element as HTMLInputElement).value).toBe("魔笛");
      expect((composerSelect.element as HTMLSelectElement).value).toBe("");
      expect((videoUrlInput.element as HTMLInputElement).value).toBe("");
    });
  });

  describe("submitLabel prop", () => {
    it("カスタムラベルが反映される", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: { composers: mockComposers, submitLabel: "登録する" },
        global: { components: { ButtonPrimary } },
      });
      expect(wrapper.find("button[type='submit']").text()).toBe("登録する");
    });
  });

  describe("カテゴリ選択フィールド", () => {
    it("4つのカテゴリ選択フィールドが表示される", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: { composers: mockComposers },
      });
      expect(wrapper.find("#genre").exists()).toBe(true);
      expect(wrapper.find("#era").exists()).toBe(true);
      expect(wrapper.find("#formation").exists()).toBe(true);
      expect(wrapper.find("#region").exists()).toBe(true);
    });

    it("カテゴリの初期値が反映される", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          composers: mockComposers,
          initialValues: {
            title: "交響曲第9番",
            composerId: COMPOSER_ID_BEETHOVEN,
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
        "ドイツ・オーストリア",
      );
    });

    it("カテゴリ未指定時はデフォルト（空）のまま", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          composers: mockComposers,
          initialValues: { title: "魔笛", composerId: COMPOSER_ID_MOZART },
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
          composers: mockComposers,
          initialValues: { title: "交響曲第9番", composerId: COMPOSER_ID_BEETHOVEN },
        },
      });

      await wrapper.find("form").trigger("submit.prevent");
      expect(wrapper.emitted("submit")).toBeDefined();
    });

    it("submit イベントにフォームデータが含まれる", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          composers: mockComposers,
          initialValues: {
            title: "交響曲第9番",
            composerId: COMPOSER_ID_BEETHOVEN,
            videoUrls: ["https://www.youtube.com/watch?v=abc"],
          },
        },
      });

      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit");
      expect(emitted).toBeDefined();
      const emittedData = emitted![0][0] as Record<string, unknown>;
      expect(emittedData.title).toBe("交響曲第9番");
      expect(emittedData.composerId).toBe(COMPOSER_ID_BEETHOVEN);
      expect(emittedData.videoUrls).toEqual(["https://www.youtube.com/watch?v=abc"]);
    });

    it("空の動画 URL は trim されて送信から除外され、全て空なら undefined", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          composers: mockComposers,
          initialValues: {
            title: "交響曲第9番",
            composerId: COMPOSER_ID_BEETHOVEN,
          },
        },
      });

      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit");
      const emittedData = emitted![0][0] as Record<string, unknown>;
      expect(emittedData.videoUrls).toBeUndefined();
    });

    it("複数の動画 URL を配列として送信できる", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          composers: mockComposers,
          initialValues: {
            title: "交響曲第9番",
            composerId: COMPOSER_ID_BEETHOVEN,
            videoUrls: [
              "https://www.youtube.com/watch?v=abc",
              "https://www.youtube.com/watch?v=def",
            ],
          },
        },
      });

      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit");
      const emittedData = emitted![0][0] as Record<string, unknown>;
      expect(emittedData.videoUrls).toEqual([
        "https://www.youtube.com/watch?v=abc",
        "https://www.youtube.com/watch?v=def",
      ]);
    });

    it("カテゴリ付きのフォームデータが submit イベントに含まれる", async () => {
      const wrapper = await mountSuspended(PieceForm, {
        props: {
          composers: mockComposers,
          initialValues: {
            title: "交響曲第9番",
            composerId: COMPOSER_ID_BEETHOVEN,
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
          composers: mockComposers,
          initialValues: { title: "魔笛", composerId: COMPOSER_ID_MOZART },
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
