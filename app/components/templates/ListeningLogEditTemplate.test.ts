import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import ListeningLogEditTemplate from "./ListeningLogEditTemplate.vue";
import type { ListeningLog } from "~/types";

mockNuxtImport("usePiecesAll", () =>
  vi
    .fn()
    .mockReturnValue({ data: ref([]), error: ref(null), pending: ref(false), refresh: vi.fn() })
);

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

describe("ListeningLogEditTemplate", () => {
  it("ページタイトルが表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogEditTemplate, {
      props: { log: sampleLog, error: null },
    });
    expect(wrapper.text()).toContain("鑑賞記録を編集");
  });

  it("エラーがないとき ErrorMessage が表示されない", async () => {
    const wrapper = await mountSuspended(ListeningLogEditTemplate, {
      props: { log: sampleLog, error: null },
    });
    expect(wrapper.findComponent({ name: "ErrorMessage" }).exists()).toBe(false);
  });

  it("エラーがあるとき ErrorMessage が表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogEditTemplate, {
      props: { log: sampleLog, error: "更新に失敗しました" },
    });
    expect(wrapper.findComponent({ name: "ErrorMessage" }).exists()).toBe(true);
  });

  it("初期値が入力フィールドに反映される", async () => {
    const wrapper = await mountSuspended(ListeningLogEditTemplate, {
      props: { log: sampleLog, error: null },
    });
    const composerInput = wrapper.find('input[placeholder="例: ベートーヴェン"]');
    expect((composerInput.element as HTMLInputElement).value).toBe("ベートーヴェン");
  });

  it("フォーム送信時に submit イベントが emit される", async () => {
    const wrapper = await mountSuspended(ListeningLogEditTemplate, {
      props: { log: sampleLog, error: null },
    });
    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.emitted("submit")).toBeDefined();
  });
});
