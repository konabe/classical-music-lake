import { mountSuspended } from "@nuxt/test-utils/runtime";
import ConcertLogEditTemplate from "./ConcertLogEditTemplate.vue";
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

describe("ConcertLogEditTemplate", () => {
  it("ページタイトルが表示される", async () => {
    const wrapper = await mountSuspended(ConcertLogEditTemplate, {
      props: { log: sampleLog, error: null },
    });
    expect(wrapper.text()).toContain("コンサート記録を編集");
  });

  it("エラーがないとき ErrorMessage が表示されない", async () => {
    const wrapper = await mountSuspended(ConcertLogEditTemplate, {
      props: { log: sampleLog, error: null },
    });
    expect(wrapper.findComponent({ name: "ErrorMessage" }).exists()).toBe(false);
  });

  it("エラーがあるとき ErrorMessage が表示される", async () => {
    const wrapper = await mountSuspended(ConcertLogEditTemplate, {
      props: { log: sampleLog, error: "更新に失敗しました" },
    });
    expect(wrapper.findComponent({ name: "ErrorMessage" }).exists()).toBe(true);
  });

  it("初期値が入力フィールドに反映される", async () => {
    const wrapper = await mountSuspended(ConcertLogEditTemplate, {
      props: { log: sampleLog, error: null },
    });
    const venueInput = wrapper.find('input[placeholder="例: サントリーホール"]');
    expect((venueInput.element as HTMLInputElement).value).toBe("サントリーホール");
  });

  it("フォーム送信時に submit イベントが emit される", async () => {
    const wrapper = await mountSuspended(ConcertLogEditTemplate, {
      props: { log: sampleLog, error: null },
    });
    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.emitted("submit")).toBeDefined();
  });
});
