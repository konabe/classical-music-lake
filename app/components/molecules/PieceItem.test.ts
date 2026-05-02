import { mountSuspended } from "@nuxt/test-utils/runtime";
import PieceItem from "./PieceItem.vue";
import ButtonSecondary from "../atoms/ButtonSecondary.vue";
import ButtonDanger from "../atoms/ButtonDanger.vue";
import type { Piece } from "~/types";

const COMPOSER_ID = "00000000-0000-4000-8000-000000000001";

const samplePiece: Piece = {
  id: "1",
  title: "交響曲第9番 ニ短調 Op.125",
  composerId: COMPOSER_ID,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const samplePieceWithCategories: Piece = {
  ...samplePiece,
  genre: "交響曲",
  era: "ロマン派",
  formation: "管弦楽",
  region: "ドイツ・オーストリア",
};

const samplePieceWithYouTubeUrl: Piece = {
  ...samplePiece,
  videoUrls: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
};

const samplePieceWithShortYouTubeUrl: Piece = {
  ...samplePiece,
  videoUrls: ["https://youtu.be/dQw4w9WgXcQ"],
};

const samplePieceWithNonYouTubeUrl: Piece = {
  ...samplePiece,
  videoUrls: ["https://example.com/video.mp4"],
};

const samplePieceWithMultipleYouTubeUrls: Piece = {
  ...samplePiece,
  videoUrls: [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=abc123",
  ],
};

const globalComponents = { global: { components: { ButtonSecondary, ButtonDanger } } };

describe("PieceItem", () => {
  describe("表示", () => {
    it("曲名が表示される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece, composerName: "ベートーヴェン" },
      });
      expect(wrapper.text()).toContain("交響曲第9番 ニ短調 Op.125");
    });

    it("作曲家が表示される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece, composerName: "ベートーヴェン" },
      });
      expect(wrapper.text()).toContain("ベートーヴェン");
    });

    it("piece-item クラスが存在する", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece, composerName: "ベートーヴェン" },
      });
      expect(wrapper.find(".piece-item").exists()).toBe(true);
    });

    it("piece-title クラスに曲名が含まれる", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece, composerName: "ベートーヴェン" },
      });
      expect(wrapper.find(".piece-title").text()).toBe("交響曲第9番 ニ短調 Op.125");
    });

    it("piece-composer クラスに作曲家が含まれる", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece, composerName: "ベートーヴェン" },
      });
      expect(wrapper.find(".piece-composer").text()).toBe("ベートーヴェン");
    });
  });

  describe("イベント", () => {
    it("編集ボタンクリックで edit イベントが emit される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece, composerName: "ベートーヴェン" },
        ...globalComponents,
      });
      await wrapper.find(".btn-secondary").trigger("click");
      expect(wrapper.emitted("edit")).toBeDefined();
    });

    it("削除ボタンクリックで delete イベントが emit される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece, composerName: "ベートーヴェン" },
        ...globalComponents,
      });
      await wrapper.find(".btn-danger").trigger("click");
      expect(wrapper.emitted("delete")).toBeDefined();
    });

    it("詳細ボタンクリックで detail イベントが emit される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece, composerName: "ベートーヴェン" },
        ...globalComponents,
      });
      await wrapper.find(".btn-detail").trigger("click");
      expect(wrapper.emitted("detail")).toBeDefined();
    });
  });

  describe("詳細ボタン表示", () => {
    it("詳細ボタンが表示される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece, composerName: "ベートーヴェン" },
      });
      expect(wrapper.find(".btn-detail").exists()).toBe(true);
    });
  });

  describe("カテゴリ表示", () => {
    it("genre が設定されている場合、ジャンルバッジが表示される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePieceWithCategories, composerName: "ベートーヴェン" },
      });
      expect(wrapper.find(".kind-genre .badge-value").text()).toBe("交響曲");
    });

    it("genre が未設定の場合、ジャンルバッジが表示されない", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece, composerName: "ベートーヴェン" },
      });
      expect(wrapper.find(".kind-genre").exists()).toBe(false);
    });

    it("era が設定されている場合、時代バッジが表示される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePieceWithCategories, composerName: "ベートーヴェン" },
      });
      expect(wrapper.find(".kind-era .badge-value").text()).toBe("ロマン派");
    });

    it("era が未設定の場合、時代バッジが表示されない", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece, composerName: "ベートーヴェン" },
      });
      expect(wrapper.find(".kind-era").exists()).toBe(false);
    });

    it("4軸すべて設定されている場合、すべてのバッジが表示される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePieceWithCategories, composerName: "ベートーヴェン" },
      });
      expect(wrapper.find(".kind-genre .badge-value").text()).toBe("交響曲");
      expect(wrapper.find(".kind-era .badge-value").text()).toBe("ロマン派");
      expect(wrapper.find(".kind-formation .badge-value").text()).toBe("管弦楽");
      expect(wrapper.find(".kind-region .badge-value").text()).toBe("ドイツ・オーストリア");
    });

    it("全カテゴリが未設定の場合、バッジが一切表示されない", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece, composerName: "ベートーヴェン" },
      });
      expect(wrapper.find(".piece-category-list").exists()).toBe(false);
    });
  });

  describe("YouTube サムネイル表示", () => {
    const expectThumbnailVisible = async (piece: Piece, shouldExist: boolean) => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece, composerName: "ベートーヴェン" },
      });
      expect(wrapper.find(".piece-thumbnail").exists()).toBe(shouldExist);
      expect(wrapper.find("img.youtube-thumbnail").exists()).toBe(shouldExist);
    };

    it("videoUrls の最初の要素が YouTube URL の場合、サムネイル領域が表示される", async () => {
      await expectThumbnailVisible(samplePieceWithYouTubeUrl, true);
    });

    it("videoUrls の最初の要素が短縮形式の YouTube URL の場合、サムネイル領域が表示される", async () => {
      await expectThumbnailVisible(samplePieceWithShortYouTubeUrl, true);
    });

    it("videoUrls が未設定の場合、サムネイル領域が表示されない", async () => {
      await expectThumbnailVisible(samplePiece, false);
    });

    it("videoUrls の最初の要素が YouTube 以外の URL の場合、サムネイル領域が表示されない", async () => {
      await expectThumbnailVisible(samplePieceWithNonYouTubeUrl, false);
    });

    it("videoUrls に複数の YouTube URL が含まれる場合、サムネイル領域が表示される", async () => {
      await expectThumbnailVisible(samplePieceWithMultipleYouTubeUrls, true);
    });

    it("サムネイル画像に曲名を含む alt 属性が設定されている", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePieceWithYouTubeUrl, composerName: "ベートーヴェン" },
      });
      expect(wrapper.find("img.youtube-thumbnail").attributes("alt")).toBe(
        "交響曲第9番 ニ短調 Op.125 の動画サムネイル",
      );
    });

    it("サムネイル領域の button に曲名を含む aria-label が設定されている", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePieceWithYouTubeUrl, composerName: "ベートーヴェン" },
      });
      expect(wrapper.find(".piece-thumbnail").attributes("aria-label")).toBe(
        "交響曲第9番 ニ短調 Op.125 の動画を再生",
      );
    });

    it("サムネイル領域クリックで play イベントが emit される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePieceWithYouTubeUrl, composerName: "ベートーヴェン" },
        ...globalComponents,
      });
      await wrapper.find(".piece-thumbnail").trigger("click");
      expect(wrapper.emitted("play")).toBeDefined();
      expect(wrapper.emitted("play")?.length).toBe(1);
    });

    it("サムネイル領域クリックでは detail イベントが emit されない", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePieceWithYouTubeUrl, composerName: "ベートーヴェン" },
        ...globalComponents,
      });
      await wrapper.find(".piece-thumbnail").trigger("click");
      expect(wrapper.emitted("detail")).toBeUndefined();
    });
  });
});
