import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import ListeningLogNewTemplate from "@/components/templates/ListeningLogNewTemplate.vue";

mockNuxtImport("usePiecesAll", () =>
  vi
    .fn()
    .mockReturnValue({ data: ref([]), error: ref(null), pending: ref(false), refresh: vi.fn() }),
);

describe("ListeningLogNewTemplate", () => {
  it("ページタイトルが表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogNewTemplate, {
      props: { error: null },
    });
    expect(wrapper.text()).toContain("鑑賞記録を追加");
  });

  it("エラーがないとき ErrorMessage が表示されない", async () => {
    const wrapper = await mountSuspended(ListeningLogNewTemplate, {
      props: { error: null },
    });
    expect(wrapper.findComponent({ name: "ErrorMessage" }).exists()).toBe(false);
  });

  it("エラーがあるとき ErrorMessage が表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogNewTemplate, {
      props: { error: "作成に失敗しました" },
    });
    expect(wrapper.findComponent({ name: "ErrorMessage" }).exists()).toBe(true);
  });

  it("ListeningLogForm が表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogNewTemplate, {
      props: { error: null },
    });
    expect(wrapper.find("form.log-form").exists()).toBe(true);
  });

  it("フォーム送信時に submit イベントが emit される", async () => {
    const wrapper = await mountSuspended(ListeningLogNewTemplate, {
      props: { error: null },
    });
    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.emitted("submit")).toBeDefined();
  });
});
