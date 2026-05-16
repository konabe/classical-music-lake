import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ThemeToggle from "@/components/atoms/ThemeToggle.vue";

const meta: Meta<typeof ThemeToggle> = {
  title: "Atoms/ThemeToggle",
  component: ThemeToggle,
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {
  args: {},
};

export const InHeader: Story = {
  args: {},
  render: () => ({
    components: { ThemeToggle },
    template: `
      <div style="background-color: #1e2d5a; padding: 1rem; display: inline-flex;">
        <ThemeToggle />
      </div>
    `,
  }),
};
