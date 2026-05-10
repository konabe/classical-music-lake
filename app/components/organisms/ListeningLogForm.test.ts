import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import ListeningLogForm from "./ListeningLogForm.vue";
import ButtonPrimary from "../atoms/ButtonPrimary.vue";
import type { Composer, PieceWork } from "~/types";

const { mockPieces, mockComposers } = vi.hoisted(() => {
  const BEETHOVEN = "00000000-0000-4000-8000-000000000001";
  const MOZART = "00000000-0000-4000-8000-000000000002";
  const MUSSORGSKY = "00000000-0000-4000-8000-000000000003";
  const STRAVINSKY = "00000000-0000-4000-8000-000000000004";
  const mockPieces: PieceWork[] = [
    {
      kind: "work",
      id: "piece-1",
      title: "交響曲第9番",
      composerId: BEETHOVEN,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      kind: "work",
      id: "piece-2",
      title: "魔笛",
      composerId: MOZART,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      kind: "work",
      id: "piece-3",
      title: "展覧会の絵",
      composerId: MUSSORGSKY,
      videoUrls: ["https://www.youtube.com/watch?v=video123"],
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      kind: "work",
      id: "piece-4",
      title: "春の祭典",
      composerId: STRAVINSKY,
      videoUrls: ["https://www.youtube.com/watch?v=video456"],
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ];
  const mockComposers: Composer[] = [
    {
      id: BEETHOVEN,
      name: "ベートーヴェン",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: MOZART,
      name: "モーツァルト",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: MUSSORGSKY,
      name: "ムソルグスキー",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: STRAVINSKY,
      name: "ストラヴィンスキー",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ];
  return { mockPieces, mockComposers };
});

mockNuxtImport("usePiecesAll", () =>
  vi.fn().mockReturnValue({
    data: ref(mockPieces),
    error: ref(null),
    pending: ref(false),
    refresh: vi.fn(),
  }),
);

mockNuxtImport("useComposersAll", () =>
  vi.fn().mockReturnValue({
    data: ref(mockComposers),
    error: ref(null),
    pending: ref(false),
    refresh: vi.fn(),
  }),
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
    it("pieceId 初期値が select に反映される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: {
          initialValues: {
            pieceId: "piece-2",
            rating: 4,
            isFavorite: true,
          },
        },
      });
      const select = wrapper.find("select#piece-select");
      expect((select.element as HTMLSelectElement).value).toBe("piece-2");
    });

    it("初期評価が星の表示に反映される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: {
          initialValues: { rating: 5, isFavorite: false },
        },
      });
      const activeStars = wrapper.findAll(".star-btn.active");
      expect(activeStars).toHaveLength(5);
    });

    it("初期お気に入りが反映される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: {
          initialValues: { isFavorite: true, rating: 3 },
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
    it("submit イベントに pieceId と派生でない入力フィールドが含まれる", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: {
          initialValues: {
            listenedAt: "2024-01-15T20:00:00.000Z",
            pieceId: "piece-1",
            rating: 5,
            isFavorite: true,
          },
        },
      });

      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit");
      expect(emitted).toBeDefined();
      const emittedData = emitted![0][0] as Record<string, unknown>;
      expect(emittedData.pieceId).toBe("piece-1");
      expect(emittedData.rating).toBe(5);
      expect(emittedData.isFavorite).toBe(true);
      expect(emittedData).not.toHaveProperty("composer");
      expect(emittedData).not.toHaveProperty("piece");
    });

    it("listenedAt は ISO 8601 UTC 形式（Zサフィックス）で emit される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm, {
        props: {
          initialValues: {
            listenedAt: "2024-01-15T20:00:00.000Z",
            pieceId: "piece-1",
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
      expect(wrapper.find("select#piece-select").exists()).toBe(true);
    });

    it("プレースホルダーオプション（楽曲未選択）が含まれる", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const options = wrapper.findAll("select#piece-select option");
      expect(options[0].text()).toContain("楽曲を選択");
    });

    it("楽曲一覧がオプションに表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const options = wrapper.findAll("select#piece-select option");
      expect(options[1].text()).toContain("交響曲第9番 / ベートーヴェン");
      expect(options[2].text()).toContain("魔笛 / モーツァルト");
    });

    it("楽曲を選択すると作曲家ヒントが表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const select = wrapper.find("select#piece-select");
      await select.setValue("piece-1");

      expect(wrapper.find(".composer-hint").text()).toContain("ベートーヴェン");
    });

    it("楽曲を選択して送信すると pieceId が submit イベントに含まれる", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const select = wrapper.find("select#piece-select");
      await select.setValue("piece-1");

      await wrapper.find("form").trigger("submit");

      const emitted = wrapper.emitted("submit");
      expect(emitted).toBeDefined();
      const payload = emitted?.[0]?.[0] as { pieceId?: string };
      expect(payload.pieceId).toBe("piece-1");
    });
  });

  describe("動画プレビュー", () => {
    it("初期状態では動画プレイヤーが表示されない", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      expect(wrapper.find(".video-player").exists()).toBe(false);
    });

    it("videoUrls ありの曲を選択すると動画プレイヤーが表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const select = wrapper.find("select#piece-select");
      await select.setValue("piece-3");
      expect(wrapper.find(".video-player").exists()).toBe(true);
    });

    it("表示された動画は選択した曲の URL を使用する", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const select = wrapper.find("select#piece-select");
      await select.setValue("piece-3");
      expect(wrapper.find("iframe").attributes("src")).toContain("video123");
    });

    it("videoUrls なしの曲を選択しても動画プレイヤーは表示されない", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const select = wrapper.find("select#piece-select");
      await select.setValue("piece-1");
      expect(wrapper.find(".video-player").exists()).toBe(false);
    });

    it("別の曲（videoUrls あり）に選択を変えると動画が切り替わる", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const select = wrapper.find("select#piece-select");

      await select.setValue("piece-3");
      expect(wrapper.find("iframe").attributes("src")).toContain("video123");

      await select.setValue("piece-4");
      expect(wrapper.find("iframe").attributes("src")).toContain("video456");
    });
  });

  describe("星評価の操作", () => {
    it("星ボタンをクリックすると評価が変わる", async () => {
      const wrapper = await mountSuspended(ListeningLogForm);
      const starButtons = wrapper.findAll(".star-btn");

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
