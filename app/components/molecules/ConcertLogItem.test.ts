import { mountSuspended } from "@nuxt/test-utils/runtime";
import ConcertLogItem from "@/components/molecules/ConcertLogItem.vue";
import ButtonSecondary from "@/components/atoms/ButtonSecondary.vue";
import type { ConcertLog } from "@/types";

const sampleLog: ConcertLog = {
  id: "1",
  userId: "user-1",
  title: "ベルリン・フィル来日公演",
  concertDate: "2024-03-01T19:00:00.000Z",
  venue: "サントリーホール",
  conductor: "カラヤン",
  orchestra: "ベルリン・フィル",
  soloist: "アルゲリッチ",
  createdAt: "2024-03-01T09:00:00.000Z",
  updatedAt: "2024-03-01T09:00:00.000Z",
};

const globalComponents = { global: { components: { ButtonSecondary } } };

describe("ConcertLogItem", () => {
  describe("表示", () => {
    it("title がタイトルとして表示され会場も別途表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogItem, {
        props: { concertLog: sampleLog },
      });
      expect(wrapper.find(".log-title").text()).toBe("ベルリン・フィル来日公演");
      expect(wrapper.find(".log-venue").text()).toBe("サントリーホール");
    });

    it("会場が表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogItem, {
        props: { concertLog: sampleLog },
      });
      expect(wrapper.text()).toContain("サントリーホール");
    });

    it("日時が表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogItem, {
        props: { concertLog: sampleLog },
      });
      expect(wrapper.text()).toContain("2024-03-01");
    });

    it("指揮者が表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogItem, {
        props: { concertLog: sampleLog },
      });
      expect(wrapper.text()).toContain("カラヤン");
    });

    it("conductor が undefined のとき表示されない", async () => {
      const wrapper = await mountSuspended(ConcertLogItem, {
        props: { concertLog: { ...sampleLog, conductor: undefined } },
      });
      expect(wrapper.find(".conductor").exists()).toBe(false);
    });

    it("log-item クラスが存在する", async () => {
      const wrapper = await mountSuspended(ConcertLogItem, {
        props: { concertLog: sampleLog },
      });
      expect(wrapper.find(".log-item").exists()).toBe(true);
    });
  });

  describe("イベント", () => {
    it("詳細ボタンクリックで detail イベントが emit される", async () => {
      const wrapper = await mountSuspended(ConcertLogItem, {
        props: { concertLog: sampleLog },
        ...globalComponents,
      });
      await wrapper.find(".btn-secondary").trigger("click");
      expect(wrapper.emitted("detail")).toBeDefined();
    });
  });
});
