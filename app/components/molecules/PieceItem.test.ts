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
      expect(wrapper.emitted("edit")).toBeTruthy();
    });

    it("削除ボタンクリックで delete イベントが emit される", async () => {
      const wrapper = await mountSuspended(PieceItem, {
        props: { piece: samplePiece },
        ...globalComponents,
      });
      await wrapper.find(".btn-danger").trigger("click");
      expect(wrapper.emitted("delete")).toBeTruthy();
    });
  });
});
