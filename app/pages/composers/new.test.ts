import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ComposerNewPage from "@/pages/composers/new.vue";
import type { CreateComposerInput } from "@/types";

const mockCreateComposer = vi.fn();

vi.mock("~/composables/useComposers", () => ({
  useComposersAll: () => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
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
      error: string | null;
    };
    await vm.handleSubmit({ name: "ベートーヴェン" });
    await flushPromises();
    expect(vm.error).toContain("失敗");
  });
});
