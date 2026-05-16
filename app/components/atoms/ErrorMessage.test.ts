import { mountSuspended } from "@nuxt/test-utils/runtime";
import ErrorMessage from "@/components/atoms/ErrorMessage.vue";

describe("ErrorMessage", () => {
  it("メッセージが表示される", async () => {
    const wrapper = await mountSuspended(ErrorMessage, {
      props: { message: "入力が無効です" },
    });
    expect(wrapper.text()).toBe("入力が無効です");
  });

  it("error-message クラスが存在する", async () => {
    const wrapper = await mountSuspended(ErrorMessage, {
      props: { message: "エラー" },
    });
    expect(wrapper.find(".error-message").exists()).toBe(true);
  });

  it("variant 未指定のとき p タグで描画される", async () => {
    const wrapper = await mountSuspended(ErrorMessage, {
      props: { message: "エラー" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("p");
  });

  it('variant="block" のとき div タグで描画される', async () => {
    const wrapper = await mountSuspended(ErrorMessage, {
      props: { message: "エラー", variant: "block" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("div");
  });

  it('variant="block" のとき block クラスが付与される', async () => {
    const wrapper = await mountSuspended(ErrorMessage, {
      props: { message: "エラー", variant: "block" },
    });
    expect(wrapper.find(".error-message.block").exists()).toBe(true);
  });

  it("center=true のとき center クラスが付与される", async () => {
    const wrapper = await mountSuspended(ErrorMessage, {
      props: { message: "エラー", center: true },
    });
    expect(wrapper.find(".center").exists()).toBe(true);
  });
});
