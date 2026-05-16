import { mountSuspended } from "@nuxt/test-utils/runtime";
import ComposerDetailPage from "@/pages/composers/[id]/index.vue";
import type { Composer } from "@/types";

const sampleComposer: Composer = {
  id: "composer-1",
  name: "ベートーヴェン",
  era: "古典派",
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
    updateComposer: vi.fn(),
    deleteComposer: vi.fn(),
  }),
  useComposer: () => ({ data: ref(sampleComposer), error: ref(null) }),
}));

describe("ComposerDetailPage", () => {
  it("ComposerDetailTemplate が表示される", async () => {
    const wrapper = await mountSuspended(ComposerDetailPage);
    expect(wrapper.findComponent({ name: "ComposerDetailTemplate" }).exists()).toBe(true);
  });

  it("作曲家名が表示される", async () => {
    const wrapper = await mountSuspended(ComposerDetailPage);
    expect(wrapper.text()).toContain("ベートーヴェン");
  });
});
