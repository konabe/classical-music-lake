import { mountSuspended } from "@nuxt/test-utils/runtime";
import ComposerEditTemplate from "@/components/templates/ComposerEditTemplate.vue";
import type { Composer } from "@/types";

const sample: Composer = {
  id: "1",
  name: "ベートーヴェン",
  era: "古典派",
  createdAt: "2024-06-01T00:00:00.000Z",
  updatedAt: "2024-06-01T00:00:00.000Z",
};

describe("ComposerEditTemplate", () => {
  it("タイトルが表示される", async () => {
    const wrapper = await mountSuspended(ComposerEditTemplate, {
      props: { composer: sample, fetchError: null, error: null },
    });
    expect(wrapper.text()).toContain("作曲家を編集");
  });

  it("fetchError が渡されるとエラーが表示されフォームが表示されない", async () => {
    const wrapper = await mountSuspended(ComposerEditTemplate, {
      props: { composer: null, fetchError: new Error("fail"), error: null },
    });
    expect(wrapper.text()).toContain("作曲家の取得に失敗しました");
    expect(wrapper.find("form.composer-form").exists()).toBe(false);
  });

  it("error があるとフォーム上部にエラーメッセージが表示される", async () => {
    const wrapper = await mountSuspended(ComposerEditTemplate, {
      props: { composer: sample, fetchError: null, error: "更新に失敗" },
    });
    expect(wrapper.text()).toContain("更新に失敗");
  });

  it("composer の値が初期値としてフォームに入る", async () => {
    const wrapper = await mountSuspended(ComposerEditTemplate, {
      props: { composer: sample, fetchError: null, error: null },
    });
    const nameInput = wrapper.find("#name");
    expect((nameInput.element as HTMLInputElement).value).toBe("ベートーヴェン");
  });
});
