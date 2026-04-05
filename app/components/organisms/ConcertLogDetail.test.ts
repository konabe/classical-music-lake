import { mountSuspended } from "@nuxt/test-utils/runtime";
import ConcertLogDetail from "./ConcertLogDetail.vue";
import type { ConcertLog } from "~/types";

const sampleLog: ConcertLog = {
  id: "log-1",
  userId: "user-1",
  concertDate: "2024-01-15T19:00:00.000Z",
  venue: "サントリーホール",
  conductor: "小澤征爾",
  orchestra: "ベルリン・フィルハーモニー管弦楽団",
  soloist: "アルゲリッチ",
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
};

describe("ConcertLogDetail", () => {
  describe("表示", () => {
    it("会場名が表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogDetail, {
        props: { log: sampleLog },
      });
      expect(wrapper.text()).toContain("サントリーホール");
    });

    it("指揮者が表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogDetail, {
        props: { log: sampleLog },
      });
      expect(wrapper.text()).toContain("小澤征爾");
    });

    it("オーケストラが表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogDetail, {
        props: { log: sampleLog },
      });
      expect(wrapper.text()).toContain("ベルリン・フィルハーモニー管弦楽団");
    });

    it("ソリストが表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogDetail, {
        props: { log: sampleLog },
      });
      expect(wrapper.text()).toContain("アルゲリッチ");
    });

    it("任意項目が未設定のとき表示されない", async () => {
      const wrapper = await mountSuspended(ConcertLogDetail, {
        props: {
          log: { ...sampleLog, conductor: undefined, orchestra: undefined, soloist: undefined },
        },
      });
      expect(wrapper.text()).not.toContain("指揮者");
      expect(wrapper.text()).not.toContain("オーケストラ");
      expect(wrapper.text()).not.toContain("ソリスト");
    });
  });
});
