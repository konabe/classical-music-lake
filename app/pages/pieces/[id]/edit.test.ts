import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import PieceEditPage from "./edit.vue";
import type { PieceWork, UpdatePieceInput } from "~/types";

const mockUpdatePiece = vi.fn();

const samplePiece: PieceWork = {
  kind: "work",
  id: "piece-1",
  title: "交響曲第9番",
  composerId: "00000000-0000-4000-8000-000000000001",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

vi.mock("~/composables/useMovements", () => ({
  useMovements: () => ({ data: ref([]), error: ref(null), pending: ref(false), refresh: vi.fn() }),
  useReplaceMovements: () => ({ replaceMovements: vi.fn() }),
}));

vi.mock("~/composables/usePieces", () => ({
  usePiecesPaginated: () => ({
    items: ref([]),
    nextCursor: ref(null),
    pending: ref(false),
    error: ref(null),
    hasMore: ref(true),
    loadMore: vi.fn(),
    reset: vi.fn(),
    retry: vi.fn(),
    createPiece: vi.fn(),
    updatePiece: mockUpdatePiece,
  }),
  usePiecesAll: () => ({
    data: ref([]),
    error: ref(null),
    pending: ref(false),
    refresh: vi.fn(),
    createPiece: vi.fn(),
    updatePiece: vi.fn(),
  }),
  usePiece: () => ({ data: ref(samplePiece), error: ref(null) }),
}));

beforeEach(() => {
  mockUpdatePiece.mockClear();
});

describe("PieceEditPage", () => {
  it("PieceEditTemplate が表示される", async () => {
    const wrapper = await mountSuspended(PieceEditPage);
    expect(wrapper.find("form.piece-form").exists()).toBe(true);
  });

  it("更新成功時に updatePiece が呼ばれる", async () => {
    mockUpdatePiece.mockResolvedValue({ ...samplePiece, title: "更新後" });
    const wrapper = await mountSuspended(PieceEditPage);
    const vm = wrapper.vm as {
      handleSubmit: (values: UpdatePieceInput) => Promise<void>;
    };
    await vm.handleSubmit({ title: "更新後" });
    await flushPromises();
    expect(mockUpdatePiece).toHaveBeenCalled();
  });

  it("更新失敗時にエラーメッセージを設定する", async () => {
    mockUpdatePiece.mockRejectedValue(new Error("failed"));
    const wrapper = await mountSuspended(PieceEditPage);
    const vm = wrapper.vm as {
      handleSubmit: (values: UpdatePieceInput) => Promise<void>;
      error: string | null;
    };
    await vm.handleSubmit({ title: "更新後" });
    await flushPromises();
    expect(vm.error).toContain("失敗");
  });
});
