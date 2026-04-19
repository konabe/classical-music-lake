import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ComposerNewPage from "./new.vue";
import type { CreateComposerInput } from "~/types";

const mockCreateComposer = vi.fn();

vi.mock("~/composables/useComposers", () => ({
  useComposersPaginated: () => ({
    items: ref([]),
    nextCursor: ref(null),
    pending: ref(false),
    error: ref(null),
    hasMore: ref(true),
    loadMore: vi.fn(),
    reset: vi.fn(),
    retry: vi.fn(),
    createComposer: mockCreateComposer,
    updateComposer: vi.fn(),
    deleteComposer: vi.fn(),
  }),
  useComposer: () => ({ data: ref(null), error: ref(null) }),
}));

beforeEach(() => {
  mockCreateComposer.mockClear();
});

describe("ComposerNewPage", () => {
  it("ComposerNewTemplate が表示される", async () => {
    const wrapper = await mountSuspended(ComposerNewPage);
    expect(wrapper.find("form.composer-form").exists()).toBe(true);
  });

  it("登録成功時に createComposer が呼ばれる", async () => {
    mockCreateComposer.mockResolvedValue({ id: "new-1" });
    const wrapper = await mountSuspended(ComposerNewPage);
    const vm = wrapper.vm as {
      handleSubmit: (values: CreateComposerInput) => Promise<void>;
    };
    await vm.handleSubmit({ name: "ベートーヴェン" });
    await flushPromises();
    expect(mockCreateComposer).toHaveBeenCalledWith({ name: "ベートーヴェン" });
  });

  it("登録失敗時にエラーメッセージを設定する", async () => {
    mockCreateComposer.mockRejectedValue(new Error("failed"));
    const wrapper = await mountSuspended(ComposerNewPage);
    const vm = wrapper.vm as {
      handleSubmit: (values: CreateComposerInput) => Promise<void>;
      errorMessage: string;
    };
    await vm.handleSubmit({ name: "ベートーヴェン" });
    await flushPromises();
    expect(vm.errorMessage).toContain("失敗");
  });
});
