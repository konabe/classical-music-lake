import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import TextInput from "./TextInput.vue";

const meta: Meta<typeof TextInput> = {
  title: "Atoms/TextInput",
  component: TextInput,
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
  args: { modelValue: "", placeholder: "例：ベートーヴェン" },
};

export const Email: Story = {
  args: { modelValue: "", type: "email", placeholder: "your@example.com" },
};

export const Password: Story = {
  args: { modelValue: "", type: "password", placeholder: "パスワードを入力" },
};

export const WithValue: Story = {
  args: { modelValue: "ベートーヴェン", placeholder: "例：ベートーヴェン" },
};

export const Disabled: Story = {
  args: { modelValue: "", placeholder: "入力できません", disabled: true },
};
