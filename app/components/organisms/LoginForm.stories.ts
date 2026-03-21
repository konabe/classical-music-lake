import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import LoginForm from "./LoginForm.vue";

const meta: Meta<typeof LoginForm> = {
  title: "Organisms/LoginForm",
  component: LoginForm,
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

const noErrors = { email: "", password: "", general: "" };

export const Default: Story = {
  args: {
    isLoading: false,
    errors: noErrors,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    errors: noErrors,
  },
};

export const WithErrors: Story = {
  args: {
    isLoading: false,
    errors: {
      email: "有効なメールアドレスを入力してください",
      password: "パスワードが正しくありません",
      general: "ログインに失敗しました",
    },
  },
};
