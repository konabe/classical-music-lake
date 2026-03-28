import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import PieceDetailPage from "./index.vue";
import type { Piece, Rating } from "~/types";

const mockCreate = vi.fn();

const samplePiece: Piece = {
  id: "piece-1",
  title: "交響曲第9番",
  composer: "ベートーヴェン",
  videoUrl: "https://www.youtube.com/watch?v=abc123",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

vi.mock("~/composables/usePieces", () => ({
  usePieces: vi.fn(),
  usePiece: () => ({ data: ref(samplePiece), error: ref(null) }),
}));

vi.mock("~/composables/useListeningLogs", () => ({
  useListeningLogs: () => ({
    data: ref([]),
    error: ref(null),
    pending: ref(false),
    refresh: vi.fn(),
    create: mockCreate,
    update: vi.fn(),
    deleteLog: vi.fn(),
  }),
  useListeningLog: () => ({ data: ref(null), error: ref(null) }),
}));

beforeEach(() => {
  mockCreate.mockClear();
});

describe("PieceDetailPage", () => {
  it("PieceDetailTemplate が表示される", async () => {
    const wrapper = await mountSuspended(PieceDetailPage);
    expect(wrapper.findComponent({ name: "PieceDetailTemplate" }).exists()).toBe(true);
  });

  it("handleSave が呼ばれると create が実行される", async () => {
    mockCreate.mockResolvedValue({ id: "log-new" });
    const wrapper = await mountSuspended(PieceDetailPage);
    const vm = wrapper.vm as {
      handleSave: (values: { rating: Rating; isFavorite: boolean; memo: string }) => Promise<void>;
    };
    await vm.handleSave({ rating: 5, isFavorite: true, memo: "最高" });
    await flushPromises();
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        composer: "ベートーヴェン",
        piece: "交響曲第9番",
        rating: 5,
        isFavorite: true,
        memo: "最高",
      })
    );
  });
});
