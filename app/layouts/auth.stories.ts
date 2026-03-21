import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import AuthLayout from "./auth.vue";

const meta: Meta<typeof AuthLayout> = {
  title: "Layouts/AuthLayout",
  component: AuthLayout,
};

export default meta;
type Story = StoryObj<typeof AuthLayout>;

export const Default: Story = {
  render: () => ({
    components: { AuthLayout },
    template: `
      <AuthLayout>
        <p style="padding: 2rem; text-align: center;">認証ページのコンテンツがここに入ります。</p>
      </AuthLayout>
    `,
  }),
};
