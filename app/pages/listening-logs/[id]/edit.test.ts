import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ListeningLogEditPage from "./edit.vue";
import type { ListeningLog, UpdateListeningLogInput } from "~/types";

const mockUpdate = vi.fn();

const sampleLog: ListeningLog = {
  id: "log-1",
  userId: "user-1",
  listenedAt: "2024-01-15T19:30:00.000Z",
  composer: "ベートーヴェン",
  piece: "交響曲第9番",
  rating: 5,
  isFavorite: false,
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
};

vi.mock("~/composables/useListeningLogs", () => ({
  useListeningLogs: () => ({
    data: [],
    error: null,
    pending: false,
    refresh: vi.fn(),
    create: vi.fn(),
    update: mockUpdate,
    deleteLog: vi.fn(),
  }),
  useListeningLog: () => ({ data: sampleLog, error: null }),
}));

vi.mock("~/composables/usePieces", () => ({
  usePieces: () => ({ data: [], error: null, pending: false }),
  usePiece: () => ({ data: null, error: null }),
}));

beforeEach(() => {
  mockUpdate.mockClear();
});

describe("ListeningLogEditPage", () => {
  it("ListeningLogEditTemplate が表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogEditPage);
    expect(wrapper.find("form.log-form").exists()).toBe(true);
  });

  it("更新成功時に update が呼ばれる", async () => {
    mockUpdate.mockResolvedValue({ ...sampleLog, rating: 4 });
    const wrapper = await mountSuspended(ListeningLogEditPage);
    const vm = wrapper.vm as {
      handleSubmit: (values: UpdateListeningLogInput) => Promise<void>;
    };
    await vm.handleSubmit({ rating: 4 });
    await flushPromises();
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("更新失敗時にエラーメッセージを設定する", async () => {
    mockUpdate.mockRejectedValue(new Error("failed"));
    const wrapper = await mountSuspended(ListeningLogEditPage);
    const vm = wrapper.vm as {
      handleSubmit: (values: UpdateListeningLogInput) => Promise<void>;
      error: string | null;
    };
    await vm.handleSubmit({ rating: 4 });
    await flushPromises();
    expect(vm.error).not.toBeNull();
  });
});
