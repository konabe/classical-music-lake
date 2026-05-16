import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ComposerForm from "@/components/organisms/ComposerForm.vue";

const meta: Meta<typeof ComposerForm> = {
  title: "Organisms/ComposerForm",
  component: ComposerForm,
};

export default meta;
type Story = StoryObj<typeof ComposerForm>;

export const Default: Story = {};

export const WithInitialValues: Story = {
  args: {
    initialValues: {
      name: "ベートーヴェン",
      era: "古典派",
      region: "ドイツ・オーストリア",
    },
  },
};

export const CustomSubmitLabel: Story = {
  args: {
    submitLabel: "登録する",
  },
};
