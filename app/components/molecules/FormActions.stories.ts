import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import FormActions from "./FormActions.vue";

const meta: Meta<typeof FormActions> = {
  title: "Molecules/FormActions",
  component: FormActions,
};

export default meta;
type Story = StoryObj<typeof FormActions>;

export const Default: Story = {
  args: {
    isSubmitting: false,
  },
};

export const CustomLabel: Story = {
  args: {
    submitLabel: "記録する",
    isSubmitting: false,
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};
