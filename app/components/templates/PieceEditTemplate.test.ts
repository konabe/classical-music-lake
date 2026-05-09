import { mountSuspended } from "@nuxt/test-utils/runtime";
import PieceEditTemplate from "./PieceEditTemplate.vue";
import type { Composer, PieceWork } from "~/types";

const COMPOSER_ID = "00000000-0000-4000-8000-000000000001";

const samplePiece: PieceWork = {
  kind: "work",
  id: "piece-1",
  title: "交響曲第9番",
  composerId: COMPOSER_ID,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const composers: Composer[] = [
  {
    id: COMPOSER_ID,
    name: "ベートーヴェン",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

describe("PieceEditTemplate", () => {
  it("ページタイトルが表示される", async () => {
    const wrapper = await mountSuspended(PieceEditTemplate, {
      props: { piece: samplePiece, fetchError: null, error: null, composers },
    });
    expect(wrapper.text()).toContain("楽曲を編集");
  });

  it("fetchError がある場合はフェッチエラーメッセージが表示される", async () => {
    const wrapper = await mountSuspended(PieceEditTemplate, {
      props: {
        piece: null,
        fetchError: new Error("fetch error"),
        error: null,
        composers,
      },
    });
    expect(wrapper.findComponent({ name: "ErrorMessage" }).exists()).toBe(true);
  });

  it("fetchError がある場合は PieceForm が表示されない", async () => {
    const wrapper = await mountSuspended(PieceEditTemplate, {
      props: {
        piece: null,
        fetchError: new Error("fetch error"),
        error: null,
        composers,
      },
    });
    expect(wrapper.find("form.piece-form").exists()).toBe(false);
  });

  it("fetchError がない場合は PieceForm が表示される", async () => {
    const wrapper = await mountSuspended(PieceEditTemplate, {
      props: { piece: samplePiece, fetchError: null, error: null, composers },
    });
    expect(wrapper.find("form.piece-form").exists()).toBe(true);
  });

  it("初期値が PieceForm に反映される", async () => {
    const wrapper = await mountSuspended(PieceEditTemplate, {
      props: { piece: samplePiece, fetchError: null, error: null, composers },
    });
    const titleInput = wrapper.find('input[placeholder="例：交響曲第9番"]');
    expect((titleInput.element as HTMLInputElement).value).toBe("交響曲第9番");
    const composerSelect = wrapper.find("#composerId");
    expect((composerSelect.element as HTMLSelectElement).value).toBe(COMPOSER_ID);
  });

  it("フォーム送信時に submit イベントが emit される", async () => {
    const wrapper = await mountSuspended(PieceEditTemplate, {
      props: { piece: samplePiece, fetchError: null, error: null, composers },
    });
    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.emitted("submit")).toBeDefined();
  });
});
