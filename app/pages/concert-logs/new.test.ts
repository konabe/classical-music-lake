import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ConcertLogNewPage from "./new.vue";
import type { CreateConcertLogInput } from "~/types";

const mockCreate = vi.fn();

vi.mock("~/composables/useConcertLogs", () => ({
  useConcertLogs: () => ({
    data: [],
    error: null,
    pending: false,
    refresh: vi.fn(),
    create: mockCreate,
    update: vi.fn(),
    deleteLog: vi.fn(),
  }),
  useConcertLog: () => ({ data: null, error: null }),
}));

vi.mock("~/composables/usePieces", () => ({
  usePieces: () => ({ data: [], error: null, pending: false }),
  usePiece: () => ({ data: null, error: null }),
}));

beforeEach(() => {
  mockCreate.mockClear();
});

const validInput: CreateConcertLogInput = {
  title: "東京交響楽団 定期演奏会",
  concertDate: "2024-03-01T19:00:00.000Z",
  venue: "サントリーホール",
};

describe("ConcertLogNewPage", () => {
  it("フォームが表示される", async () => {
    const wrapper = await mountSuspended(ConcertLogNewPage);
    expect(wrapper.find("form").exists()).toBe(true);
  });

  it("作成成功時に create が呼ばれる", async () => {
    mockCreate.mockResolvedValue({ id: "cl-new" });
    const wrapper = await mountSuspended(ConcertLogNewPage);
    const vm = wrapper.vm as {
      handleSubmit: (values: CreateConcertLogInput) => Promise<void>;
    };
    await vm.handleSubmit(validInput);
    await flushPromises();
    expect(mockCreate).toHaveBeenCalledWith(validInput);
  });

  it("作成失敗時にエラーメッセージを設定する", async () => {
    mockCreate.mockRejectedValue(new Error("failed"));
    const wrapper = await mountSuspended(ConcertLogNewPage);
    const vm = wrapper.vm as {
      handleSubmit: (values: CreateConcertLogInput) => Promise<void>;
      error: string | null;
    };
    await vm.handleSubmit(validInput);
    await flushPromises();
    expect(vm.error).toBe("記録の作成に失敗しました。");
  });
});
