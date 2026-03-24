import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import AuthFormContainer from "./AuthFormContainer.vue";

const meta: Meta<typeof AuthFormContainer> = {
  title: "Molecules/AuthFormContainer",
  component: AuthFormContainer,
};

export default meta;
type Story = StoryObj<typeof AuthFormContainer>;

export const Login: Story = {
  args: { title: "ログイン" },
  render: (args) => ({
    components: { AuthFormContainer },
    setup: () => ({ args }),
    template: `
      <AuthFormContainer v-bind="args">
        <p style="color: #666;">フォームの内容がここに入ります</p>
      </AuthFormContainer>
    `,
  }),
};

export const Register: Story = {
  args: { title: "新規登録" },
  render: (args) => ({
    components: { AuthFormContainer },
    setup: () => ({ args }),
    template: `
      <AuthFormContainer v-bind="args">
        <p style="color: #666;">フォームの内容がここに入ります</p>
      </AuthFormContainer>
    `,
  }),
};

export const VerifyEmail: Story = {
  args: { title: "メールアドレス確認" },
  render: (args) => ({
    components: { AuthFormContainer },
    setup: () => ({ args }),
    template: `
      <AuthFormContainer v-bind="args">
        <p style="color: #666;">フォームの内容がここに入ります</p>
      </AuthFormContainer>
    `,
  }),
};
