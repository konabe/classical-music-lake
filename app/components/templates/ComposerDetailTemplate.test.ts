import { mountSuspended } from "@nuxt/test-utils/runtime";
import ComposerDetailTemplate from "./ComposerDetailTemplate.vue";
import type { Composer } from "~/types";

const sample: Composer = {
  id: "1",
  name: "ベートーヴェン",
  era: "古典派",
  region: "ドイツ・オーストリア",
  createdAt: "2024-06-01T00:00:00.000Z",
  updatedAt: "2024-06-01T00:00:00.000Z",
};

describe("ComposerDetailTemplate", () => {
  it("作曲家名が表示される", async () => {
    const wrapper = await mountSuspended(ComposerDetailTemplate, {
      props: { composer: sample, error: null, isAdmin: false },
    });
    expect(wrapper.find(".composer-name").text()).toBe("ベートーヴェン");
  });

  it("管理者の場合、編集・削除ボタンが表示される", async () => {
    const wrapper = await mountSuspended(ComposerDetailTemplate, {
      props: { composer: sample, error: null, isAdmin: true },
    });
    expect(wrapper.find("a.admin-link").exists()).toBe(true);
    expect(wrapper.find(".admin-link--danger").exists()).toBe(true);
  });

  it("非管理者の場合、編集・削除ボタンが表示されない", async () => {
    const wrapper = await mountSuspended(ComposerDetailTemplate, {
      props: { composer: sample, error: null, isAdmin: false },
    });
    expect(wrapper.find("a.admin-link").exists()).toBe(false);
    expect(wrapper.find(".admin-link--danger").exists()).toBe(false);
  });

  it("削除ボタンクリックで delete イベントが emit される", async () => {
    const wrapper = await mountSuspended(ComposerDetailTemplate, {
      props: { composer: sample, error: null, isAdmin: true },
    });
    await wrapper.find(".admin-link--danger").trigger("click");
    expect(wrapper.emitted("delete")).toBeDefined();
  });

  it("error 状態の場合、エラーメッセージが表示される", async () => {
    const wrapper = await mountSuspended(ComposerDetailTemplate, {
      props: { composer: null, error: new Error("fail"), isAdmin: false },
    });
    expect(wrapper.text()).toContain("作曲家の取得に失敗しました");
  });

  it("imageUrl が設定されている場合、画像が表示される", async () => {
    const wrapper = await mountSuspended(ComposerDetailTemplate, {
      props: {
        composer: { ...sample, imageUrl: "https://example.com/beethoven.jpg" },
        error: null,
        isAdmin: false,
      },
    });
    const img = wrapper.find("img.composer-image");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("https://example.com/beethoven.jpg");
  });

  it("imageUrl が未設定の場合、画像が表示されない", async () => {
    const wrapper = await mountSuspended(ComposerDetailTemplate, {
      props: { composer: sample, error: null, isAdmin: false },
    });
    expect(wrapper.find("img.composer-image").exists()).toBe(false);
  });
});
