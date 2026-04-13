import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ListeningLogNewPage from "./new.vue";
import type { CreateListeningLogInput } from "~/types";

const mockCreate = vi.fn();

vi.mock("~/composables/useListeningLogs", () => ({
  useListeningLogs: () => ({
    data: [],
    error: null,
    pending: false,
    refresh: vi.fn(),
    create: mockCreate,
    update: vi.fn(),
    deleteLog: vi.fn(),
  }),
  useListeningLog: () => ({ data: null, error: null }),
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
    updatePiece: vi.fn(),
  }),
  usePiecesAll: () => ({
    data: ref([]),
    error: ref(null),
    pending: ref(false),
    refresh: vi.fn(),
    createPiece: vi.fn(),
    updatePiece: vi.fn(),
  }),
  usePiece: () => ({ data: null, error: null }),
}));

beforeEach(() => {
  mockCreate.mockClear();
});

const validInput: CreateListeningLogInput = {
  listenedAt: "2024-01-15T19:30:00.000Z",
  composer: "ベートーヴェン",
  piece: "交響曲第9番",
  rating: 5,
  isFavorite: false,
};

describe("ListeningLogNewPage", () => {
  it("ListeningLogNewTemplate が表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogNewPage);
    expect(wrapper.find("form.log-form").exists()).toBe(true);
  });

  it("作成成功時に create が呼ばれる", async () => {
    mockCreate.mockResolvedValue({ id: "log-new" });
    const wrapper = await mountSuspended(ListeningLogNewPage);
    const vm = wrapper.vm as {
      handleSubmit: (values: CreateListeningLogInput) => Promise<void>;
    };
    await vm.handleSubmit(validInput);
    await flushPromises();
    expect(mockCreate).toHaveBeenCalledWith(validInput);
  });

  it("作成失敗時にエラーメッセージを設定する", async () => {
    mockCreate.mockRejectedValue(new Error("failed"));
    const wrapper = await mountSuspended(ListeningLogNewPage);
    const vm = wrapper.vm as {
      handleSubmit: (values: CreateListeningLogInput) => Promise<void>;
      error: string | null;
    };
    await vm.handleSubmit(validInput);
    await flushPromises();
    expect(vm.error).not.toBeNull();
  });
});
