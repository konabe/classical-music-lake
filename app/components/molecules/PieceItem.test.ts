import { mountSuspended } from "@nuxt/test-utils/runtime";
import PieceItem from "./PieceItem.vue";
import ButtonSecondary from "../atoms/ButtonSecondary.vue";
import ButtonDanger from "../atoms/ButtonDanger.vue";
import type { Piece } from "~/types";

const samplePiece: Piece = {
  id: "1",
  title: "交響曲第9番 ニ短調 Op.125",
  composer: "ベートーヴェン",
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

const globalComponents = { global: { components: { ButtonSecondary, ButtonDanger } } };

describe("PieceItem", () => {
  describe("表示", () => {
    it("曲名が表示される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece },
      });
      expect(wrapper.text()).toContain("交響曲第9番 ニ短調 Op.125");
    });

    it("作曲家が表示される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece },
      });
      expect(wrapper.text()).toContain("ベートーヴェン");
    });

    it("piece-item クラスが存在する", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece },
      });
      expect(wrapper.find(".piece-item").exists()).toBe(true);
    });

    it("piece-title クラスに曲名が含まれる", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece },
      });
      expect(wrapper.find(".piece-title").text()).toBe("交響曲第9番 ニ短調 Op.125");
    });

    it("piece-composer クラスに作曲家が含まれる", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece },
      });
      expect(wrapper.find(".piece-composer").text()).toBe("ベートーヴェン");
    });
  });

  describe("イベント", () => {
    it("編集ボタンクリックで edit イベントが emit される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece },
        ...globalComponents,
      });
      await wrapper.find(".btn-secondary").trigger("click");
      expect(wrapper.emitted("edit")).toBeDefined();
    });

    it("削除ボタンクリックで delete イベントが emit される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece },
        ...globalComponents,
      });
      await wrapper.find(".btn-danger").trigger("click");
      expect(wrapper.emitted("delete")).toBeDefined();
    });

    it("詳細ボタンクリックで detail イベントが emit される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece },
        ...globalComponents,
      });
      await wrapper.find(".btn-detail").trigger("click");
      expect(wrapper.emitted("detail")).toBeDefined();
    });
  });

  describe("詳細ボタン表示", () => {
    it("詳細ボタンが表示される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece },
      });
      expect(wrapper.find(".btn-detail").exists()).toBe(true);
    });
  });

  describe("カテゴリ表示", () => {
    it("genre が設定されている場合、ジャンルバッジが表示される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePieceWithCategories },
      });
      expect(wrapper.text()).toContain("ジャンル: 交響曲");
    });

    it("genre が未設定の場合、ジャンルバッジが表示されない", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece },
      });
      expect(wrapper.text()).not.toContain("ジャンル:");
    });

    it("era が設定されている場合、時代バッジが表示される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePieceWithCategories },
      });
      expect(wrapper.text()).toContain("時代: ロマン派");
    });

    it("era が未設定の場合、時代バッジが表示されない", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece },
      });
      expect(wrapper.text()).not.toContain("時代:");
    });

    it("4軸すべて設定されている場合、すべてのバッジが表示される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePieceWithCategories },
      });
      expect(wrapper.text()).toContain("ジャンル: 交響曲");
      expect(wrapper.text()).toContain("時代: ロマン派");
      expect(wrapper.text()).toContain("編成: 管弦楽");
      expect(wrapper.text()).toContain("地域: ドイツ・オーストリア");
    });

    it("全カテゴリが未設定の場合、バッジが一切表示されない", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece },
      });
      expect(wrapper.text()).not.toContain("ジャンル:");
      expect(wrapper.text()).not.toContain("時代:");
      expect(wrapper.text()).not.toContain("編成:");
      expect(wrapper.text()).not.toContain("地域:");
    });
  });
});
