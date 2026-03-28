import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import PiecesPage from "./index.vue";
import type { Piece } from "~/types";

const { samplePieces, mockRefresh } = vi.hoisted(() => {
  const samplePieces: Piece[] = [
    {
      id: "piece-1",
      title: "交響曲第9番",
      composer: "ベートーヴェン",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ];
  return { samplePieces, mockRefresh: vi.fn() };
});

mockNuxtImport("useFetch", () =>
  vi.fn().mockReturnValue({
    data: samplePieces,
    error: null,
    refresh: mockRefresh,
  })
);

const mockFetch = vi.fn();

beforeEach(() => {
  mockRefresh.mockClear();
  mockFetch.mockClear();
  vi.stubGlobal("$fetch", mockFetch);
  vi.stubGlobal(
    "confirm",
    vi.fn(() => true)
  );
  vi.stubGlobal("alert", vi.fn());
});

describe("PiecesPage", () => {
  it("楽曲一覧が表示される", async () => {
    const wrapper = await mountSuspended(PiecesPage);
    expect(wrapper.findAllComponents({ name: "PieceItem" })).toHaveLength(1);
  });

  it("削除確認で OK を選ぶと $fetch が呼ばれる", async () => {
    mockFetch.mockResolvedValue(undefined);
    const wrapper = await mountSuspended(PiecesPage);
    await wrapper.find(".btn-danger").trigger("click");
    await flushPromises();
    expect(mockFetch).toHaveBeenCalled();
  });

  it("削除後に refresh が呼ばれる", async () => {
    mockFetch.mockResolvedValue(undefined);
    const wrapper = await mountSuspended(PiecesPage);
    await wrapper.find(".btn-danger").trigger("click");
    await flushPromises();
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("削除キャンセル時は $fetch が呼ばれない", async () => {
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false)
    );
    const wrapper = await mountSuspended(PiecesPage);
    await wrapper.find(".btn-danger").trigger("click");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
