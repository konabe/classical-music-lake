import { mountSuspended } from "@nuxt/test-utils/runtime";
import LoginTemplate from "@/components/templates/LoginTemplate.vue";

const defaultErrors = { email: "", password: "", general: "" };

describe("LoginTemplate", () => {
  it("LoginForm が表示される", async () => {
    const wrapper = await mountSuspended(LoginTemplate, {
      props: { isLoading: false, errors: defaultErrors },
    });
    expect(wrapper.find("form").exists()).toBe(true);
  });

  it("submit イベントが上位に伝達される", async () => {
    const wrapper = await mountSuspended(LoginTemplate, {
      props: { isLoading: false, errors: defaultErrors },
    });
    await wrapper.find('input[type="email"]').setValue("user@example.com");
    await wrapper.find('input[type="password"]').setValue("pass");
    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.emitted("submit")).toBeDefined();
  });
});
