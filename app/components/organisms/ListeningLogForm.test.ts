import { ref } from "vue";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import ListeningLogForm from "./ListeningLogForm.vue";
import ButtonPrimary from "../atoms/ButtonPrimary.vue";
import type { Piece } from "~/types";

const { mockPieces } = vi.hoisted(() => {
  const mockPieces: Piece[] = [
    {
      id: "piece-1",
      title: "交響曲第9番",
      composer: "ベートーヴェン",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "piece-2",
      title: "魔笛",
      composer: "モーツァルト",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "piece-3",
      title: "展覧会の絵",
      composer: "ムソルグスキー",
      videoUrl: "https://www.youtube.com/watch?v=video123",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "piece-4",
      title: "春の祭典",
      composer: "ストラヴィンスキー",
      videoUrl: "https://www.youtube.com/watch?v=video456",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ];
  return { mockPieces };
});

mockNuxtImport("usePieces", () =>
  vi.fn().mockReturnValue({ data: ref(mockPieces), error: ref(null), pending: ref(false) })
);

describe("ListeningLogForm", () => {
  describe("デフォルト値でのレンダリング", () => {
    it("フォームが表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      expect(wrapper.find("form.log-form").exists()).toBe(true);
    });

    it("デフォルトの評価は 3", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const activeStars = wrapper.findAll(".star-btn.active");
      expect(activeStars).toHaveLength(3);
    });

    it("デフォルトのお気に入りは未チェック", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const checkbox = wrapper.find('input[type="checkbox"]');
      expect((checkbox.element as HTMLInputElement).checked).toBe(false);
    });

    it("送信ラベルのデフォルトは「保存する」", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        global: { components: { ButtonPrimary } },
      });
      expect(wrapper.find("button[type='submit']").text()).toBe("保存する");
    });
  });

  describe("initialValues での初期化", () => {
    it("初期値が入力フィールドに反映される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: {
          initialValues: {
            composer: "モーツァルト",
            piece: "魔笛",
            rating: 4,
            isFavorite: true,
          },
        },
      });

      const composerInput = wrapper.find('input[placeholder="例: ベートーヴェン"]');
      expect((composerInput.element as HTMLInputElement).value).toBe("モーツァルト");

      const pieceInput = wrapper.find('input[placeholder="例: 交響曲第9番"]');
      expect((pieceInput.element as HTMLInputElement).value).toBe("魔笛");
    });

    it("初期評価が星の表示に反映される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: {
          initialValues: { rating: 5, composer: "", piece: "", isFavorite: false },
        },
      });

      const activeStars = wrapper.findAll(".star-btn.active");
      expect(activeStars).toHaveLength(5);
    });

    it("初期お気に入りが反映される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: {
          initialValues: { isFavorite: true, composer: "", piece: "", rating: 3 },
        },
      });

      const checkbox = wrapper.find('input[type="checkbox"]');
      expect((checkbox.element as HTMLInputElement).checked).toBe(true);
    });
  });

  describe("submitLabel prop", () => {
    it("カスタムラベルが反映される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: { submitLabel: "記録する" },
        global: { components: { ButtonPrimary } },
      });
      expect(wrapper.find("button[type='submit']").text()).toBe("記録する");
    });
  });

  describe("フォーム送信", () => {
    it("フォーム送信時に submit イベントが emit される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: {
          initialValues: {
            listenedAt: "2024-01-15T20:00",
            composer: "ベートーヴェン",
            piece: "交響曲第9番",
            rating: 5,
            isFavorite: false,
          },
        },
      });

      await wrapper.find("form").trigger("submit.prevent");
      expect(wrapper.emitted("submit")).toBeTruthy();
    });

    it("submit イベントにフォームデータが含まれる", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: {
          initialValues: {
            listenedAt: "2024-01-15T20:00:00.000Z",
            composer: "ベートーヴェン",
            piece: "交響曲第9番",
            rating: 5,
            isFavorite: true,
          },
        },
      });

      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit");
      expect(emitted).toBeTruthy();
      const emittedData = emitted![0][0] as Record<string, unknown>;
      expect(emittedData.composer).toBe("ベートーヴェン");
      expect(emittedData.piece).toBe("交響曲第9番");
      expect(emittedData.isFavorite).toBe(true);
    });

    it("listenedAt は ISO 8601 UTC 形式（Zサフィックス）で emit される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: {
          initialValues: {
            listenedAt: "2024-01-15T20:00:00.000Z",
            composer: "ベートーヴェン",
            piece: "交響曲第9番",
            rating: 5,
            isFavorite: false,
          },
        },
      });

      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit");
      const emittedData = emitted![0][0] as Record<string, unknown>;
      expect(emittedData.listenedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe("楽曲選択", () => {
    it("楽曲選択セレクトボックスが表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      expect(wrapper.find("select.piece-select").exists()).toBe(true);
    });

    it("「選択しない」オプションが含まれる", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const options = wrapper.findAll("select.piece-select option");
      expect(options[0].text()).toBe("選択しない");
    });

    it("楽曲一覧がオプションに表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const options = wrapper.findAll("select.piece-select option");
      expect(options[1].text()).toBe("交響曲第9番 / ベートーヴェン");
      expect(options[2].text()).toBe("魔笛 / モーツァルト");
    });

    it("楽曲を選択すると曲名・作曲家が自動入力される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const select = wrapper.find("select.piece-select");
      await select.setValue("piece-1");

      const composerInput = wrapper.find('input[placeholder="例: ベートーヴェン"]');
      const pieceInput = wrapper.find('input[placeholder="例: 交響曲第9番"]');
      expect((composerInput.element as HTMLInputElement).value).toBe("ベートーヴェン");
      expect((pieceInput.element as HTMLInputElement).value).toBe("交響曲第9番");
    });

    it("「選択しない」を選ぶと曲名・作曲家がクリアされる", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const select = wrapper.find("select.piece-select");

      await select.setValue("piece-1");
      await select.setValue("");

      const composerInput = wrapper.find('input[placeholder="例: ベートーヴェン"]');
      const pieceInput = wrapper.find('input[placeholder="例: 交響曲第9番"]');
      expect((composerInput.element as HTMLInputElement).value).toBe("");
      expect((pieceInput.element as HTMLInputElement).value).toBe("");
    });
  });

  describe("動画プレビュー", () => {
    it("初期状態では動画プレイヤーが表示されない", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      expect(wrapper.find(".video-player").exists()).toBe(false);
    });

    it("videoUrl ありの曲を選択すると動画プレイヤーが表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const select = wrapper.find("select.piece-select");
      await select.setValue("piece-3");
      expect(wrapper.find(".video-player").exists()).toBe(true);
    });

    it("表示された動画は選択した曲の URL を使用する", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const select = wrapper.find("select.piece-select");
      await select.setValue("piece-3");
      expect(wrapper.find("iframe").attributes("src")).toContain("video123");
    });

    it("videoUrl なしの曲を選択しても動画プレイヤーは表示されない", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const select = wrapper.find("select.piece-select");
      await select.setValue("piece-1");
      expect(wrapper.find(".video-player").exists()).toBe(false);
    });

    it("別の曲（videoUrl あり）に選択を変えると動画が切り替わる", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const select = wrapper.find("select.piece-select");

      await select.setValue("piece-3");
      expect(wrapper.find("iframe").attributes("src")).toContain("video123");

      await select.setValue("piece-4");
      expect(wrapper.find("iframe").attributes("src")).toContain("video456");
    });

    it("「選択しない」にすると動画が非表示になる", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const select = wrapper.find("select.piece-select");

      await select.setValue("piece-3");
      expect(wrapper.find(".video-player").exists()).toBe(true);

      await select.setValue("");
      expect(wrapper.find(".video-player").exists()).toBe(false);
    });
  });

  describe("星評価の操作", () => {
    it("星ボタンをクリックすると評価が変わる", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const starButtons = wrapper.findAll(".star-btn");

      // 1番目の星をクリック（評価を1に）
      await starButtons[0].trigger("click");
      const activeStars = wrapper.findAll(".star-btn.active");
      expect(activeStars).toHaveLength(1);
    });

    it("5番目の星をクリックすると評価が5になる", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const starButtons = wrapper.findAll(".star-btn");

      await starButtons[4].trigger("click");
      const activeStars = wrapper.findAll(".star-btn.active");
      expect(activeStars).toHaveLength(5);
    });
  });
});
