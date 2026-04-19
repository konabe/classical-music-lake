import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import PageHeader from "./PageHeader.vue";

const meta: Meta<typeof PageHeader> = {
  title: "Molecules/PageHeader",
  component: PageHeader,
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const ListeningLogs: Story = {
  args: {
    title: "鑑賞記録",
    newPagePath: "/listening-logs/new",
  },
  render: (args) => {
    return {
      components: { PageHeader },
      setup: () => {
        return { args };
      },
      template: `<PageHeader v-bind="args">+ 新しい記録</PageHeader>`,
    };
  },
};

export const Pieces: Story = {
  args: {
    title: "楽曲マスタ",
    newPagePath: "/pieces/new",
  },
  render: (args) => {
    return {
      components: { PageHeader },
      setup: () => {
        return { args };
      },
      template: `<PageHeader v-bind="args">+ 新しい楽曲</PageHeader>`,
    };
  },
};
