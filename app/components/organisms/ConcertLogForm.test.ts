import { mountSuspended } from "@nuxt/test-utils/runtime";
import ConcertLogForm from "./ConcertLogForm.vue";
import type { Piece } from "~/types";

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
    title: "ピアノ協奏曲第1番",
    composer: "チャイコフスキー",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

vi.mock("~/composables/usePieces", () => ({
  usePiecesAll: () => ({
    data: ref(mockPieces),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
    createPiece: vi.fn(),
    updatePiece: vi.fn(),
  }),
}));

describe("ConcertLogForm", () => {
  describe("表示", () => {
    it("コンサート名入力欄が表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogForm);
      expect(
        wrapper.find('input[placeholder="例: 〇〇交響楽団 定期演奏会 第123回"]').exists()
      ).toBe(true);
    });

    it("会場入力欄が表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogForm);
      expect(wrapper.find('input[placeholder="例: サントリーホール"]').exists()).toBe(true);
    });

    it("submitLabel が反映される", async () => {
      const wrapper = await mountSuspended(ConcertLogForm, {
        props: { submitLabel: "保存する" },
      });
      expect(wrapper.text()).toContain("保存する");
    });

    it("楽曲選択セクションが表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogForm);
      expect(wrapper.text()).toContain("プログラム");
    });

    it("楽曲マスタの選択肢が表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogForm);
      expect(wrapper.text()).toContain("交響曲第9番");
      expect(wrapper.text()).toContain("ピアノ協奏曲第1番");
    });
  });

  describe("楽曲選択", () => {
    it("楽曲を選択して追加するとプログラムリストに表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogForm);
      await wrapper.find("select[data-testid='piece-select']").setValue("piece-1");
      await wrapper.find("button[data-testid='add-piece']").trigger("click");
      expect(wrapper.findAll("[data-testid='program-item']")).toHaveLength(1);
    });

    it("追加した楽曲をプログラムリストから削除できる", async () => {
      const wrapper = await mountSuspended(ConcertLogForm);
      await wrapper.find("select[data-testid='piece-select']").setValue("piece-1");
      await wrapper.find("button[data-testid='add-piece']").trigger("click");
      await wrapper.find("button[data-testid='remove-piece']").trigger("click");
      expect(wrapper.findAll("[data-testid='program-item']")).toHaveLength(0);
    });

    it("initialValues に pieceIds がある場合、初期表示でプログラムリストに表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogForm, {
        props: {
          initialValues: { pieceIds: ["piece-1"] },
        },
      });
      expect(wrapper.findAll("[data-testid='program-item']")).toHaveLength(1);
      expect(wrapper.text()).toContain("交響曲第9番");
    });
  });

  describe("イベント", () => {
    it("フォームを送信すると submit イベントが emit される", async () => {
      const wrapper = await mountSuspended(ConcertLogForm);
      await wrapper.find('input[type="datetime-local"]').setValue("2024-03-01T19:00");
      await wrapper.find('input[placeholder="例: サントリーホール"]').setValue("サントリーホール");
      await wrapper.find("form").trigger("submit");
      expect(wrapper.emitted("submit")).toBeDefined();
    });

    it("楽曲を追加して送信すると pieceIds が emit される", async () => {
      const wrapper = await mountSuspended(ConcertLogForm);
      await wrapper.find('input[type="datetime-local"]').setValue("2024-03-01T19:00");
      await wrapper.find('input[placeholder="例: サントリーホール"]').setValue("サントリーホール");
      await wrapper.find("select[data-testid='piece-select']").setValue("piece-1");
      await wrapper.find("button[data-testid='add-piece']").trigger("click");
      await wrapper.find("form").trigger("submit");
      const emitted = wrapper.emitted("submit");
      expect(emitted).toBeDefined();
      const payload = emitted![0][0] as { pieceIds?: string[] };
      expect(payload.pieceIds).toEqual(["piece-1"]);
    });

    it("楽曲を追加しない場合は pieceIds が空配列で emit される", async () => {
      const wrapper = await mountSuspended(ConcertLogForm);
      await wrapper.find('input[type="datetime-local"]').setValue("2024-03-01T19:00");
      await wrapper.find('input[placeholder="例: サントリーホール"]').setValue("サントリーホール");
      await wrapper.find("form").trigger("submit");
      const emitted = wrapper.emitted("submit");
      expect(emitted).toBeDefined();
      const payload = emitted![0][0] as { pieceIds?: string[] };
      expect(payload.pieceIds).toEqual([]);
    });
  });
});
