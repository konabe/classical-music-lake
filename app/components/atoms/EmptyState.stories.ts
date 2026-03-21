import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import EmptyState from "./EmptyState.vue";

const meta: Meta<typeof EmptyState> = {
  title: "Atoms/EmptyState",
  component: EmptyState,
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const NoLogs: Story = {
  args: {},
  render: () => ({
    components: { EmptyState },
    template: "<EmptyState>まだ記録がありません。最初の鑑賞記録を追加しましょう。</EmptyState>",
  }),
};

export const NoPieces: Story = {
  args: {},
  render: () => ({
    components: { EmptyState },
    template: "<EmptyState>楽曲が登録されていません。最初の楽曲を追加しましょう。</EmptyState>",
  }),
};
