import { mountSuspended } from "@nuxt/test-utils/runtime";
import UserRegisterTemplate from "./UserRegisterTemplate.vue";

const defaultErrors = { email: "", password: "" };

describe("UserRegisterTemplate", () => {
  it("UserRegisterForm が表示される", async () => {
    const wrapper = await mountSuspended(UserRegisterTemplate, {
      props: { isLoading: false, errors: defaultErrors, successMessage: "" },
    });
    expect(wrapper.find("form").exists()).toBe(true);
  });

  it("successMessage が渡されると表示される", async () => {
    const wrapper = await mountSuspended(UserRegisterTemplate, {
      props: {
        isLoading: false,
        errors: defaultErrors,
        successMessage: "登録が完了しました",
      },
    });
    expect(wrapper.find(".success-message").exists()).toBe(true);
  });

  it("submit イベントが上位に伝達される", async () => {
    const wrapper = await mountSuspended(UserRegisterTemplate, {
      props: { isLoading: false, errors: defaultErrors, successMessage: "" },
    });
    await wrapper.find('input[type="email"]').setValue("user@example.com");
    await wrapper.find('input[type="password"]').setValue("SecurePass1");
    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.emitted("submit")).toBeDefined();
  });
});
