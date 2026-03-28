import { mountSuspended } from "@nuxt/test-utils/runtime";
import PieceNewTemplate from "./PieceNewTemplate.vue";

describe("PieceNewTemplate", () => {
  it("ページタイトルが表示される", async () => {
    const wrapper = await mountSuspended(PieceNewTemplate, {
      props: { errorMessage: "" },
    });
    expect(wrapper.text()).toContain("楽曲を追加");
  });

  it("エラーがないとき ErrorMessage が表示されない", async () => {
    const wrapper = await mountSuspended(PieceNewTemplate, {
      props: { errorMessage: "" },
    });
    expect(wrapper.findComponent({ name: "ErrorMessage" }).exists()).toBe(false);
  });

  it("エラーがあるとき ErrorMessage が表示される", async () => {
    const wrapper = await mountSuspended(PieceNewTemplate, {
      props: { errorMessage: "登録に失敗しました" },
    });
    expect(wrapper.findComponent({ name: "ErrorMessage" }).exists()).toBe(true);
  });

  it("PieceForm が表示される", async () => {
    const wrapper = await mountSuspended(PieceNewTemplate, {
      props: { errorMessage: "" },
    });
    expect(wrapper.find("form.piece-form").exists()).toBe(true);
  });

  it("フォーム送信時に submit イベントが emit される", async () => {
    const wrapper = await mountSuspended(PieceNewTemplate, {
      props: { errorMessage: "" },
    });
    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.emitted("submit")).toBeDefined();
  });
});
