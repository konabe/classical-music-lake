import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import PieceForm from "./PieceForm.vue";

const meta: Meta<typeof PieceForm> = {
  title: "Organisms/PieceForm",
  component: PieceForm,
};

export default meta;
type Story = StoryObj<typeof PieceForm>;

export const Default: Story = {};

export const WithInitialValues: Story = {
  args: {
    initialValues: {
      title: "交響曲第9番",
      composer: "ベートーヴェン",
      videoUrl: "https://www.youtube.com/watch?v=abc123",
    },
  },
};

export const WithCategories: Story = {
  args: {
    initialValues: {
      title: "交響曲第9番",
      composer: "ベートーヴェン",
      genre: "交響曲",
      era: "古典派",
      formation: "管弦楽",
      region: "ドイツ・オーストリア",
    },
  },
};

export const CustomSubmitLabel: Story = {
  args: {
    submitLabel: "登録する",
  },
};
