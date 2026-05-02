import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ComposerEditPage from "./edit.vue";
import type { Composer, UpdateComposerInput } from "~/types";

const mockUpdateComposer = vi.fn();

const sampleComposer: Composer = {
  id: "composer-1",
  name: "ベートーヴェン",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

vi.mock("~/composables/useComposers", () => ({
  useComposersAll: () => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
    createComposer: vi.fn(),
    updateComposer: mockUpdateComposer,
    deleteComposer: vi.fn(),
  }),
  useComposer: () => ({ data: ref(sampleComposer), error: ref(null) }),
}));

beforeEach(() => {
  mockUpdateComposer.mockClear();
});

describe("ComposerEditPage", () => {
  it("ComposerEditTemplate が表示される", async () => {
    const wrapper = await mountSuspended(ComposerEditPage);
    expect(wrapper.find("form.composer-form").exists()).toBe(true);
  });

  it("更新成功時に updateComposer が呼ばれる", async () => {
    mockUpdateComposer.mockResolvedValue({ ...sampleComposer, name: "モーツァルト" });
    const wrapper = await mountSuspended(ComposerEditPage);
    const vm = wrapper.vm as {
      handleSubmit: (values: UpdateComposerInput) => Promise<void>;
    };
    await vm.handleSubmit({ name: "モーツァルト" });
    await flushPromises();
    expect(mockUpdateComposer).toHaveBeenCalled();
  });

  it("更新失敗時にエラーメッセージを設定する", async () => {
    mockUpdateComposer.mockRejectedValue(new Error("failed"));
    const wrapper = await mountSuspended(ComposerEditPage);
    const vm = wrapper.vm as {
      handleSubmit: (values: UpdateComposerInput) => Promise<void>;
      error: string | null;
    };
    await vm.handleSubmit({ name: "モーツァルト" });
    await flushPromises();
    expect(vm.error).toContain("失敗");
  });
});
