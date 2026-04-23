import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import PageTitle from "./PageTitle.vue";

const meta: Meta<typeof PageTitle> = {
  title: "Atoms/PageTitle",
  component: PageTitle,
};

export default meta;
type Story = StoryObj<typeof PageTitle>;

export const Default: Story = {
  render: () => ({
    components: { PageTitle },
    template: "<PageTitle>ページタイトル</PageTitle>",
  }),
};

export const ComposerNew: Story = {
  render: () => ({
    components: { PageTitle },
    template: "<PageTitle>作曲家を追加</PageTitle>",
  }),
};

export const ConcertLogEdit: Story = {
  render: () => ({
    components: { PageTitle },
    template: "<PageTitle>コンサート記録を編集</PageTitle>",
  }),
};
