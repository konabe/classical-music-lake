import { mountSuspended } from "@nuxt/test-utils/runtime";
import ListeningLogItem from "./ListeningLogItem.vue";
import ButtonSecondary from "../atoms/ButtonSecondary.vue";
import ButtonDanger from "../atoms/ButtonDanger.vue";
import type { ListeningLog } from "~/types";

const sampleLog: ListeningLog = {
  id: "1",
  userId: null,
  listenedAt: "2024-03-01T14:00:00.000Z",
  composer: "ベートーヴェン",
  piece: "交響曲第9番 ニ短調 Op.125",
  rating: 5,
  isFavorite: true,
  memo: "フルトヴェングラー指揮、歴史的名演。",
  createdAt: "2024-03-01T14:00:00.000Z",
  updatedAt: "2024-03-01T14:00:00.000Z",
};

const globalComponents = { global: { components: { ButtonSecondary, ButtonDanger } } };

describe("ListeningLogItem", () => {
  describe("表示", () => {
    it("曲名が表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogItem, {
        props: { listeningLog: sampleLog },
      });
      expect(wrapper.text()).toContain("交響曲第9番 ニ短調 Op.125");
    });

    it("作曲家が表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogItem, {
        props: { listeningLog: sampleLog },
      });
      expect(wrapper.text()).toContain("ベートーヴェン");
    });

    it("メモが表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogItem, {
        props: { listeningLog: sampleLog },
      });
      expect(wrapper.text()).toContain("フルトヴェングラー指揮、歴史的名演。");
    });

    it("memo が undefined のとき log-memo 要素が存在しない", async () => {
      const wrapper = await mountSuspended(ListeningLogItem, {
        props: { listeningLog: { ...sampleLog, memo: undefined } },
      });
      expect(wrapper.find(".log-memo").exists()).toBe(false);
    });

    it("log-item クラスが存在する", async () => {
      const wrapper = await mountSuspended(ListeningLogItem, {
        props: { listeningLog: sampleLog },
      });
      expect(wrapper.find(".log-item").exists()).toBe(true);
    });
  });

  describe("イベント", () => {
    it("編集ボタンクリックで edit イベントが emit される", async () => {
      const wrapper = await mountSuspended(ListeningLogItem, {
        props: { listeningLog: sampleLog },
        ...globalComponents,
      });
      await wrapper.find(".btn-secondary").trigger("click");
      expect(wrapper.emitted("edit")).toBeDefined();
    });

    it("削除ボタンクリックで delete イベントが emit される", async () => {
      const wrapper = await mountSuspended(ListeningLogItem, {
        props: { listeningLog: sampleLog },
        ...globalComponents,
      });
      await wrapper.find(".btn-danger").trigger("click");
      expect(wrapper.emitted("delete")).toBeDefined();
    });
  });
});
