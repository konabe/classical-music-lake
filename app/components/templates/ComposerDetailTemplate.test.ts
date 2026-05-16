import { mountSuspended } from "@nuxt/test-utils/runtime";
import ComposerDetailTemplate from "@/components/templates/ComposerDetailTemplate.vue";
import type { Composer, PieceWork } from "@/types";

const sample: Composer = {
  id: "1",
  name: "ベートーヴェン",
  era: "古典派",
  region: "ドイツ・オーストリア",
  createdAt: "2024-06-01T00:00:00.000Z",
  updatedAt: "2024-06-01T00:00:00.000Z",
};

const samplePieces: PieceWork[] = [
  {
    kind: "work",
    id: "p1",
    title: "交響曲第9番",
    composerId: "1",
    genre: "交響曲",
    era: "古典派",
    formation: "管弦楽",
    region: "ドイツ・オーストリア",
    createdAt: "2024-06-01T00:00:00.000Z",
    updatedAt: "2024-06-01T00:00:00.000Z",
  },
  {
    kind: "work",
    id: "p2",
    title: "ピアノソナタ第14番「月光」",
    composerId: "1",
    genre: "独奏曲",
    era: "古典派",
    formation: "ピアノ独奏",
    region: "ドイツ・オーストリア",
    createdAt: "2024-06-02T00:00:00.000Z",
    updatedAt: "2024-06-02T00:00:00.000Z",
  },
];

const baseProps = {
  composer: sample,
  error: null,
  isAdmin: false,
  pieces: [],
  piecesError: null,
  piecesPending: false,
};

describe("ComposerDetailTemplate", () => {
  it("作曲家名が表示される", async () => {
    const wrapper = await mountSuspended(ComposerDetailTemplate, {
      props: baseProps,
    });
    expect(wrapper.find(".composer-name").text()).toBe("ベートーヴェン");
  });

  it("管理者の場合、編集・削除ボタンが表示される", async () => {
    const wrapper = await mountSuspended(ComposerDetailTemplate, {
      props: { ...baseProps, isAdmin: true },
    });
    expect(wrapper.find("a.admin-link").exists()).toBe(true);
    expect(wrapper.find(".admin-link--danger").exists()).toBe(true);
  });

  it("非管理者の場合、編集・削除ボタンが表示されない", async () => {
    const wrapper = await mountSuspended(ComposerDetailTemplate, {
      props: baseProps,
    });
    expect(wrapper.find("a.admin-link").exists()).toBe(false);
    expect(wrapper.find(".admin-link--danger").exists()).toBe(false);
  });

  it("削除ボタンクリックで delete イベントが emit される", async () => {
    const wrapper = await mountSuspended(ComposerDetailTemplate, {
      props: { ...baseProps, isAdmin: true },
    });
    await wrapper.find(".admin-link--danger").trigger("click");
    expect(wrapper.emitted("delete")).toBeDefined();
  });

  it("error 状態の場合、エラーメッセージが表示される", async () => {
    const wrapper = await mountSuspended(ComposerDetailTemplate, {
      props: { ...baseProps, composer: null, error: new Error("fail") },
    });
    expect(wrapper.text()).toContain("作曲家の取得に失敗しました");
  });

  it("imageUrl が設定されている場合、画像が表示される", async () => {
    const wrapper = await mountSuspended(ComposerDetailTemplate, {
      props: {
        ...baseProps,
        composer: { ...sample, imageUrl: "https://example.com/beethoven.jpg" },
      },
    });
    const img = wrapper.find("img.composer-image");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("https://example.com/beethoven.jpg");
  });

  it("imageUrl が未設定の場合、画像が表示されない", async () => {
    const wrapper = await mountSuspended(ComposerDetailTemplate, {
      props: baseProps,
    });
    expect(wrapper.find("img.composer-image").exists()).toBe(false);
  });

  describe("楽曲一覧セクション", () => {
    it("pieces が空の場合、空状態メッセージが表示される", async () => {
      const wrapper = await mountSuspended(ComposerDetailTemplate, {
        props: baseProps,
      });
      expect(wrapper.text()).toContain("この作曲家の楽曲はまだ登録されていません");
    });

    it("pieces が渡された場合、各楽曲のタイトルとリンクが表示される", async () => {
      const wrapper = await mountSuspended(ComposerDetailTemplate, {
        props: { ...baseProps, pieces: samplePieces },
      });
      const items = wrapper.findAll(".works-item");
      expect(items).toHaveLength(2);
      expect(wrapper.text()).toContain("交響曲第9番");
      expect(wrapper.text()).toContain("ピアノソナタ第14番「月光」");
      const links = wrapper.findAll(".works-link");
      expect(links[0]?.attributes("href")).toBe("/pieces/p1");
      expect(links[1]?.attributes("href")).toBe("/pieces/p2");
    });

    it("pieces 数がヘッダーに反映される", async () => {
      const wrapper = await mountSuspended(ComposerDetailTemplate, {
        props: { ...baseProps, pieces: samplePieces },
      });
      expect(wrapper.find(".works-count").text()).toContain("02");
      expect(wrapper.find(".works-count").text()).toContain("pieces");
    });

    it("piecesError が設定されている場合、エラーメッセージが表示される", async () => {
      const wrapper = await mountSuspended(ComposerDetailTemplate, {
        props: { ...baseProps, piecesError: new Error("fail") },
      });
      expect(wrapper.text()).toContain("楽曲一覧の取得に失敗しました");
    });

    it("piecesPending が true で pieces が空の場合、読み込み中表示", async () => {
      const wrapper = await mountSuspended(ComposerDetailTemplate, {
        props: { ...baseProps, piecesPending: true },
      });
      expect(wrapper.find(".works-status").exists()).toBe(true);
      expect(wrapper.find(".works-status").text()).toContain("読み込み中");
    });
  });
});
