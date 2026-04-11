import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import UserRegisterForm from "./UserRegisterForm.vue";

const meta: Meta<typeof UserRegisterForm> = {
  title: "Organisms/UserRegisterForm",
  component: UserRegisterForm,
};

export default meta;
type Story = StoryObj<typeof UserRegisterForm>;

const noErrors = { email: "", password: "" };

export const Default: Story = {
  args: {
    isLoading: false,
    errors: noErrors,
    successMessage: "",
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    errors: noErrors,
    successMessage: "",
  },
};

export const WithErrors: Story = {
  args: {
    isLoading: false,
    errors: {
      email: "有効なメールアドレスを入力してください",
      password: "パスワードは8文字以上で入力してください", // NOSONAR: エラーメッセージであり実際のパスワードではない
    },
    successMessage: "",
  },
};

export const WithSuccess: Story = {
  args: {
    isLoading: false,
    errors: noErrors,
    successMessage: "確認メールを送信しました。メールをご確認ください。",
  },
};
