import { mountSuspended } from "@nuxt/test-utils/runtime";
import PiecesTemplate from "./PiecesTemplate.vue";
import type { Piece } from "~/types";

const samplePieces: Piece[] = [
  {
    id: "piece-1",
    title: "交響曲第9番",
    composer: "ベートーヴェン",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

describe("PiecesTemplate", () => {
  it("ページヘッダーが表示される", async () => {
    const wrapper = await mountSuspended(PiecesTemplate, {
      props: { pieces: [], error: null },
    });
    expect(wrapper.text()).toContain("楽曲マスタ");
  });

  it("新規追加ボタンが表示される", async () => {
    const wrapper = await mountSuspended(PiecesTemplate, {
      props: { pieces: [], error: null },
    });
    expect(wrapper.text()).toContain("新しい楽曲");
  });

  it("pieces を渡すと PieceList に伝達される", async () => {
    const wrapper = await mountSuspended(PiecesTemplate, {
      props: { pieces: samplePieces, error: null },
    });
    expect(wrapper.findAllComponents({ name: "PieceItem" })).toHaveLength(1);
  });

  it("delete イベントが上位に伝達される", async () => {
    const wrapper = await mountSuspended(PiecesTemplate, {
      props: { pieces: samplePieces, error: null },
    });
    await wrapper.find(".btn-danger").trigger("click");
    expect(wrapper.emitted("delete")).toBeDefined();
  });
});
