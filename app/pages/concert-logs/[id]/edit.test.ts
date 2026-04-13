import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ConcertLogEditPage from "./edit.vue";
import type { ConcertLog, UpdateConcertLogInput } from "~/types";

const mockUpdate = vi.fn();

const sampleLog: ConcertLog = {
  id: "cl-123",
  userId: "user-1",
  title: "東京交響楽団 定期演奏会",
  concertDate: "2024-03-01T19:00:00.000Z",
  venue: "サントリーホール",
  conductor: "カラヤン",
  createdAt: "2024-03-01T20:00:00.000Z",
  updatedAt: "2024-03-01T20:00:00.000Z",
};

vi.mock("~/composables/useConcertLogs", () => ({
  useConcertLogs: () => ({
    data: [],
    error: null,
    pending: false,
    refresh: vi.fn(),
    create: vi.fn(),
    update: mockUpdate,
    deleteLog: vi.fn(),
  }),
  useConcertLog: () => ({ data: sampleLog, error: null, pending: false }),
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
  mockUpdate.mockClear();
});

describe("ConcertLogEditPage", () => {
  it("編集フォームが表示される", async () => {
    const wrapper = await mountSuspended(ConcertLogEditPage);
    expect(wrapper.find("form").exists()).toBe(true);
  });

  it("更新成功時に update が呼ばれる", async () => {
    mockUpdate.mockResolvedValue({ ...sampleLog, title: "更新後タイトル" });
    const wrapper = await mountSuspended(ConcertLogEditPage);
    const vm = wrapper.vm as {
      handleSubmit: (values: UpdateConcertLogInput) => Promise<void>;
    };
    await vm.handleSubmit({ title: "更新後タイトル" });
    await flushPromises();
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("更新失敗時にエラーメッセージを設定する", async () => {
    mockUpdate.mockRejectedValue(new Error("failed"));
    const wrapper = await mountSuspended(ConcertLogEditPage);
    const vm = wrapper.vm as {
      handleSubmit: (values: UpdateConcertLogInput) => Promise<void>;
      error: string | null;
    };
    await vm.handleSubmit({ title: "失敗テスト" });
    await flushPromises();
    expect(vm.error).toBe("記録の更新に失敗しました。");
  });
});
