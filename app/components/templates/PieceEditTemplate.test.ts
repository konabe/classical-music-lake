import { mountSuspended } from "@nuxt/test-utils/runtime";
import PieceEditTemplate from "./PieceEditTemplate.vue";
import type { Piece } from "~/types";

const samplePiece: Piece = {
  id: "piece-1",
  title: "交響曲第9番",
  composer: "ベートーヴェン",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("PieceEditTemplate", () => {
  it("ページタイトルが表示される", async () => {
    const wrapper = await mountSuspended(PieceEditTemplate, {
      props: { piece: samplePiece, fetchError: null, errorMessage: "" },
    });
    expect(wrapper.text()).toContain("楽曲を編集");
  });

  it("fetchError がある場合はフェッチエラーメッセージが表示される", async () => {
    const wrapper = await mountSuspended(PieceEditTemplate, {
      props: { piece: null, fetchError: new Error("fetch error"), errorMessage: "" },
    });
    expect(wrapper.findComponent({ name: "ErrorMessage" }).exists()).toBe(true);
  });

  it("fetchError がある場合は PieceForm が表示されない", async () => {
    const wrapper = await mountSuspended(PieceEditTemplate, {
      props: { piece: null, fetchError: new Error("fetch error"), errorMessage: "" },
    });
    expect(wrapper.find("form.piece-form").exists()).toBe(false);
  });

  it("fetchError がない場合は PieceForm が表示される", async () => {
    const wrapper = await mountSuspended(PieceEditTemplate, {
      props: { piece: samplePiece, fetchError: null, errorMessage: "" },
    });
    expect(wrapper.find("form.piece-form").exists()).toBe(true);
  });

  it("初期値が PieceForm に反映される", async () => {
    const wrapper = await mountSuspended(PieceEditTemplate, {
      props: { piece: samplePiece, fetchError: null, errorMessage: "" },
    });
    const titleInput = wrapper.find('input[placeholder="例：交響曲第9番"]');
    expect((titleInput.element as HTMLInputElement).value).toBe("交響曲第9番");
  });

  it("フォーム送信時に submit イベントが emit される", async () => {
    const wrapper = await mountSuspended(PieceEditTemplate, {
      props: { piece: samplePiece, fetchError: null, errorMessage: "" },
    });
    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.emitted("submit")).toBeDefined();
  });
});
