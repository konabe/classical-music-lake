import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import UserRegisterTemplate from "@/components/templates/UserRegisterTemplate.vue";

const meta: Meta<typeof UserRegisterTemplate> = {
  title: "Templates/UserRegisterTemplate",
  component: UserRegisterTemplate,
};

export default meta;
type Story = StoryObj<typeof UserRegisterTemplate>;

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
      email: "このメールアドレスは既に登録されています",
      password: "パスワードは8文字以上で、大文字・小文字・数字を含む必要があります", // NOSONAR: エラーメッセージであり実際のパスワードではない
    },
    successMessage: "",
  },
};

export const WithSuccess: Story = {
  args: {
    isLoading: false,
    errors: noErrors,
    successMessage: "登録が完了しました。ログイン画面からログインしてください。",
  },
};
