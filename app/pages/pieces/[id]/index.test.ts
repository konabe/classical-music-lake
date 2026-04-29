import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import PieceDetailPage from "./index.vue";
import type { Composer, Piece, Rating } from "~/types";

const mockCreate = vi.fn();

const COMPOSER_ID = "00000000-0000-4000-8000-000000000001";

const samplePiece: Piece = {
  id: "piece-1",
  title: "交響曲第9番",
  composerId: COMPOSER_ID,
  videoUrl: "https://www.youtube.com/watch?v=abc123",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const sampleComposers: Composer[] = [
  {
    id: COMPOSER_ID,
    name: "ベートーヴェン",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

vi.mock("~/composables/usePieces", () => ({
  usePiecesPaginated: vi.fn(),
  usePiecesAll: vi.fn(),
  usePiece: () => ({ data: ref(samplePiece), error: ref(null) }),
}));

vi.mock("~/composables/useComposers", () => ({
  useComposersPaginated: vi.fn(),
  useComposer: vi.fn(),
  useComposersAll: () => ({
    data: ref(sampleComposers),
    error: ref(null),
    pending: ref(false),
    refresh: vi.fn().mockResolvedValue(undefined),
  }),
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
  useListeningLogCreate: () => ({ create: mockCreate }),
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
