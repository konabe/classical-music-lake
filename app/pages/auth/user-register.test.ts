import { mountSuspended } from "@nuxt/test-utils/runtime";
import UserRegisterPage from "./user-register.vue";

const mockRegister = vi.fn();
const mockValidateEmail = vi.fn();

vi.mock("~/composables/useAuth", () => ({
  useAuth: () => ({
    register: mockRegister,
    validateEmail: mockValidateEmail,
  }),
}));

beforeEach(() => {
  mockRegister.mockClear();
  mockValidateEmail.mockClear();
  sessionStorage.clear();
});

describe("UserRegisterPage", () => {
  it("メールアドレスが無効な場合は register を呼ばない", async () => {
    mockValidateEmail.mockReturnValue(false);

    const wrapper = await mountSuspended(UserRegisterPage);
    const vm = wrapper.vm as {
      handleSubmit: (email: string, password: string) => Promise<void>;
    };
    await vm.handleSubmit("invalid-email", "SecurePass1");

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("登録成功時に pendingPassword を sessionStorage に保存する", async () => {
    mockValidateEmail.mockReturnValue(true);
    mockRegister.mockResolvedValue({ success: true });

    const wrapper = await mountSuspended(UserRegisterPage);
    const vm = wrapper.vm as {
      handleSubmit: (email: string, password: string) => Promise<void>;
    };
    await vm.handleSubmit("user@example.com", "SecurePass1");

    expect(sessionStorage.getItem("pendingPassword")).toBe("SecurePass1");
  });

  it("登録成功時に verify-email ページへリダイレクトする", async () => {
    mockValidateEmail.mockReturnValue(true);
    mockRegister.mockResolvedValue({ success: true });

    const wrapper = await mountSuspended(UserRegisterPage);
    const pushSpy = vi.spyOn(wrapper.vm.$router, "push");
    const vm = wrapper.vm as {
      handleSubmit: (email: string, password: string) => Promise<void>;
    };
    await vm.handleSubmit("user@example.com", "SecurePass1");

    expect(pushSpy).toHaveBeenCalledWith(expect.objectContaining({ path: "/auth/verify-email" }));
  });

  it("登録失敗時（already含む）はメールエラーを表示する", async () => {
    mockValidateEmail.mockReturnValue(true);
    mockRegister.mockResolvedValue({ success: false, error: "Email already registered" });

    const wrapper = await mountSuspended(UserRegisterPage);
    const vm = wrapper.vm as {
      handleSubmit: (email: string, password: string) => Promise<void>;
      errors: { email: string; password: string };
    };
    await vm.handleSubmit("user@example.com", "SecurePass1");

    expect(vm.errors.email).toBe("このメールアドレスは既に登録されています");
  });
});
