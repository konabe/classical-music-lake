import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import DefaultLayout from "@/layouts/default.vue";

const meta: Meta<typeof DefaultLayout> = {
  title: "Layouts/DefaultLayout",
  component: DefaultLayout,
};

export default meta;
type Story = StoryObj<typeof DefaultLayout>;

export const LoggedIn: Story = {
  render: () => ({
    components: { DefaultLayout },
    template: `
      <DefaultLayout>
        <p style="padding: 1rem;">ページコンテンツがここに入ります。</p>
      </DefaultLayout>
    `,
  }),
};
