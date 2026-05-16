import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import QuickLogForm from "@/components/organisms/QuickLogForm.vue";

const meta: Meta<typeof QuickLogForm> = {
  title: "Organisms/QuickLogForm",
  component: QuickLogForm,
};

export default meta;
type Story = StoryObj<typeof QuickLogForm>;

export const Default: Story = {
  args: {
    composer: "ベートーヴェン",
    piece: "交響曲第9番 ニ短調 Op.125",
  },
};

export const ShortTitle: Story = {
  args: {
    composer: "モーツァルト",
    piece: "魔笛",
  },
};
