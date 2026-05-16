import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import PasswordInput from "@/components/molecules/PasswordInput.vue";

const meta: Meta<typeof PasswordInput> = {
  title: "Molecules/PasswordInput",
  component: PasswordInput,
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {
  args: { modelValue: "", placeholder: "パスワードを入力" },
};

export const WithValue: Story = {
  args: { modelValue: "MyPassword1", placeholder: "パスワードを入力" },
};

export const Disabled: Story = {
  args: { modelValue: "MyPassword1", disabled: true },
};
