import { mountSuspended } from "@nuxt/test-utils/runtime";
import ConcertLogDetail from "./ConcertLogDetail.vue";
import type { ConcertLog, Piece } from "~/types";

const sampleLog: ConcertLog = {
  id: "log-1",
  userId: "user-1",
  title: "定期演奏会 第100回",
  concertDate: "2024-01-15T19:00:00.000Z",
  venue: "サントリーホール",
  conductor: "小澤征爾",
  orchestra: "ベルリン・フィルハーモニー管弦楽団",
  soloist: "アルゲリッチ",
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
};

const samplePieces: Piece[] = [
  {
    id: "piece-1",
    title: "交響曲第9番",
    composer: "ベートーヴェン",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "piece-2",
    title: "ピアノ協奏曲第1番",
    composer: "チャイコフスキー",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

describe("ConcertLogDetail", () => {
  describe("表示", () => {
    it("title が見出しに表示され会場は詳細に表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogDetail, {
        props: { log: sampleLog, pieces: [] },
      });
      expect(wrapper.find("h1").text()).toBe("定期演奏会 第100回");
      expect(wrapper.text()).toContain("会場");
      expect(wrapper.text()).toContain("サントリーホール");
    });

    it("会場名が表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogDetail, {
        props: { log: sampleLog, pieces: [] },
      });
      expect(wrapper.text()).toContain("サントリーホール");
    });

    it("指揮者が表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogDetail, {
        props: { log: sampleLog, pieces: [] },
      });
      expect(wrapper.text()).toContain("小澤征爾");
    });

    it("オーケストラが表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogDetail, {
        props: { log: sampleLog, pieces: [] },
      });
      expect(wrapper.text()).toContain("ベルリン・フィルハーモニー管弦楽団");
    });

    it("ソリストが表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogDetail, {
        props: { log: sampleLog, pieces: [] },
      });
      expect(wrapper.text()).toContain("アルゲリッチ");
    });

    it("任意項目が未設定のとき表示されない", async () => {
      const wrapper = await mountSuspended(ConcertLogDetail, {
        props: {
          log: { ...sampleLog, conductor: undefined, orchestra: undefined, soloist: undefined },
          pieces: [],
        },
      });
      expect(wrapper.text()).not.toContain("指揮者");
      expect(wrapper.text()).not.toContain("オーケストラ");
      expect(wrapper.text()).not.toContain("ソリスト");
    });
  });

  describe("プログラム表示", () => {
    it("pieceIds がある場合、楽曲一覧が演奏順で表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogDetail, {
        props: {
          log: { ...sampleLog, pieceIds: ["piece-1", "piece-2"] },
          pieces: samplePieces,
        },
      });
      expect(wrapper.text()).toContain("交響曲第9番");
      expect(wrapper.text()).toContain("ピアノ協奏曲第1番");
      expect(wrapper.text()).toContain("ベートーヴェン");
    });

    it("pieceIds が空の場合、プログラムなしメッセージが表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogDetail, {
        props: { log: { ...sampleLog, pieceIds: [] }, pieces: samplePieces },
      });
      expect(wrapper.text()).toContain("プログラムなし");
    });

    it("pieceIds が未設定の場合もプログラムなしメッセージが表示される", async () => {
      const wrapper = await mountSuspended(ConcertLogDetail, {
        props: { log: sampleLog, pieces: samplePieces },
      });
      expect(wrapper.text()).toContain("プログラムなし");
    });
  });
});
