import { mountSuspended } from "@nuxt/test-utils/runtime";
import ComposerItem from "./ComposerItem.vue";
import ButtonSecondary from "../atoms/ButtonSecondary.vue";
import ButtonDanger from "../atoms/ButtonDanger.vue";
import type { Composer } from "~/types";

const sampleComposer: Composer = {
  id: "1",
  name: "ベートーヴェン",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const sampleComposerWithCategories: Composer = {
  ...sampleComposer,
  era: "古典派",
  region: "ドイツ・オーストリア",
};

const globalComponents = { global: { components: { ButtonSecondary, ButtonDanger } } };

describe("ComposerItem", () => {
  describe("表示", () => {
    it("作曲家名が表示される", async () => {
      const wrapper = await mountSuspended(ComposerItem, {
        props: { composer: sampleComposer },
      });
      expect(wrapper.text()).toContain("ベートーヴェン");
    });

    it("composer-item クラスが存在する", async () => {
      const wrapper = await mountSuspended(ComposerItem, {
        props: { composer: sampleComposer },
      });
      expect(wrapper.find(".composer-item").exists()).toBe(true);
    });

    it("composer-name クラスに作曲家名が含まれる", async () => {
      const wrapper = await mountSuspended(ComposerItem, {
        props: { composer: sampleComposer },
      });
      expect(wrapper.find(".composer-name").text()).toBe("ベートーヴェン");
    });
  });

  describe("イベント", () => {
    it("編集ボタンクリックで edit イベントが emit される", async () => {
      const wrapper = await mountSuspended(ComposerItem, {
        props: { composer: sampleComposer },
        ...globalComponents,
      });
      await wrapper.find(".btn-secondary").trigger("click");
      expect(wrapper.emitted("edit")).toBeDefined();
    });

    it("削除ボタンクリックで delete イベントが emit される", async () => {
      const wrapper = await mountSuspended(ComposerItem, {
        props: { composer: sampleComposer },
        ...globalComponents,
      });
      await wrapper.find(".btn-danger").trigger("click");
      expect(wrapper.emitted("delete")).toBeDefined();
    });

    it("詳細ボタンクリックで detail イベントが emit される", async () => {
      const wrapper = await mountSuspended(ComposerItem, {
        props: { composer: sampleComposer },
        ...globalComponents,
      });
      await wrapper.find(".btn-detail").trigger("click");
      expect(wrapper.emitted("detail")).toBeDefined();
    });
  });

  describe("カテゴリ表示", () => {
    it("era が設定されている場合、時代バッジが表示される", async () => {
      const wrapper = await mountSuspended(ComposerItem, {
        props: { composer: sampleComposerWithCategories },
      });
      expect(wrapper.find(".kind-era").text()).toBe("古典派");
    });

    it("region が設定されている場合、地域バッジが表示される", async () => {
      const wrapper = await mountSuspended(ComposerItem, {
        props: { composer: sampleComposerWithCategories },
      });
      expect(wrapper.find(".kind-region").text()).toBe("ドイツ・オーストリア");
    });

    it("全カテゴリが未設定の場合、バッジが一切表示されない", async () => {
      const wrapper = await mountSuspended(ComposerItem, {
        props: { composer: sampleComposer },
      });
      expect(wrapper.find(".composer-category-list").exists()).toBe(false);
    });
  });
});
