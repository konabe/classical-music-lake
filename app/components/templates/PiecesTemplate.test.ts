import { mountSuspended } from "@nuxt/test-utils/runtime";
import PiecesTemplate from "./PiecesTemplate.vue";
import type { Piece } from "~/types";

const COMPOSER_ID = "00000000-0000-4000-8000-000000000001";
const composerNameById = { [COMPOSER_ID]: "ベートーヴェン" };

const samplePieces: Piece[] = [
  {
    id: "piece-1",
    title: "交響曲第9番",
    composerId: COMPOSER_ID,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

const baseProps = {
  pieces: [] as Piece[],
  error: null as Error | null,
  pending: false,
  hasMore: false,
  composerNameById,
};

describe("PiecesTemplate", () => {
  it("ページヘッダーが表示される", async () => {
    const wrapper = await mountSuspended(PiecesTemplate, {
      props: { ...baseProps, isAdmin: false },
    });
    expect(wrapper.find("h1.masthead-title").text()).toContain("楽曲");
  });

  it("isAdmin が true のとき新規追加ボタンが表示される", async () => {
    const wrapper = await mountSuspended(PiecesTemplate, {
      props: { ...baseProps, isAdmin: true },
    });
    expect(wrapper.text()).toContain("新しい楽曲");
  });

  it("isAdmin が false のとき新規追加ボタンが表示されない", async () => {
    const wrapper = await mountSuspended(PiecesTemplate, {
      props: { ...baseProps, isAdmin: false },
    });
    expect(wrapper.text()).not.toContain("新しい楽曲");
  });

  it("pieces を渡すと PieceList に伝達される", async () => {
    const wrapper = await mountSuspended(PiecesTemplate, {
      props: { ...baseProps, pieces: samplePieces, isAdmin: false },
    });
    expect(wrapper.findAllComponents({ name: "PieceItem" })).toHaveLength(1);
  });

  it("delete イベントが上位に伝達される", async () => {
    const wrapper = await mountSuspended(PiecesTemplate, {
      props: { ...baseProps, pieces: samplePieces, isAdmin: false },
    });
    await wrapper.find(".btn-danger").trigger("click");
    expect(wrapper.emitted("delete")).toBeDefined();
  });
});
