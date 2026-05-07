import { mountSuspended } from "@nuxt/test-utils/runtime";
import ListeningLogDetail from "./ListeningLogDetail.vue";
import type { ListeningLog } from "~/types";

const sampleLog: ListeningLog = {
  id: "log-1",
  userId: "user-1",
  listenedAt: "2024-01-15T19:30:00.000Z",
  composer: "ベートーヴェン",
  piece: "交響曲第9番 ニ短調 Op.125",
  rating: 5,
  isFavorite: false,
  memo: "カラヤン指揮、素晴らしい演奏",
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
};

describe("ListeningLogDetail", () => {
  describe("表示", () => {
    it("曲名が表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogDetail, {
        props: { log: sampleLog },
      });
      expect(wrapper.text()).toContain("交響曲第9番 ニ短調 Op.125");
    });

    it("作曲家が表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogDetail, {
        props: { log: sampleLog },
      });
      expect(wrapper.text()).toContain("ベートーヴェン");
    });

    it("メモが表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogDetail, {
        props: { log: sampleLog },
      });
      expect(wrapper.find(".memo").exists()).toBe(true);
      expect(wrapper.text()).toContain("カラヤン指揮、素晴らしい演奏");
    });

    it("memo が未設定のとき感想・メモセクションが表示されない", async () => {
      const wrapper = await mountSuspended(ListeningLogDetail, {
        props: { log: { ...sampleLog, memo: undefined } },
      });
      expect(wrapper.find(".memo").exists()).toBe(false);
    });
  });

  describe("楽曲リンク", () => {
    it("log.pieceId が設定されていると楽曲詳細へのリンクが表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogDetail, {
        props: { log: { ...sampleLog, pieceId: "piece-1" } },
      });
      const link = wrapper.find(".piece-link");
      expect(link.exists()).toBe(true);
      expect(link.attributes("href")).toBe("/pieces/piece-1");
      expect(link.text()).toContain("交響曲第9番 ニ短調 Op.125");
    });

    it("log.pieceId が未設定だとリンクは表示されずテキストとして表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogDetail, {
        props: { log: sampleLog },
      });
      expect(wrapper.find(".piece-link").exists()).toBe(false);
      expect(wrapper.text()).toContain("交響曲第9番 ニ短調 Op.125");
    });
  });
});
