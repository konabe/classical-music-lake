import { mountSuspended } from "@nuxt/test-utils/runtime";
import VerifyEmailTemplate from "./VerifyEmailTemplate.vue";

describe("VerifyEmailTemplate", () => {
  it("VerifyEmailForm が表示される", async () => {
    const wrapper = await mountSuspended(VerifyEmailTemplate, {
      props: {
        email: "user@example.com",
        isLoading: false,
        error: "",
        infoMessage: "",
      },
    });
    expect(wrapper.findComponent({ name: "VerifyEmailForm" }).exists()).toBe(true);
  });

  it("submit イベントが上位に伝達される", async () => {
    const wrapper = await mountSuspended(VerifyEmailTemplate, {
      props: {
        email: "user@example.com",
        isLoading: false,
        error: "",
        infoMessage: "",
      },
    });
    await wrapper.find('input[type="text"]').setValue("123456");
    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.emitted("submit")).toBeDefined();
  });

  it("resend イベントが上位に伝達される", async () => {
    const wrapper = await mountSuspended(VerifyEmailTemplate, {
      props: {
        email: "user@example.com",
        isLoading: false,
        error: "",
        infoMessage: "",
      },
    });
    await wrapper.find(".resend-button").trigger("click");
    expect(wrapper.emitted("resend")).toBeDefined();
  });
});
