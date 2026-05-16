import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import SelectInput from "@/components/atoms/SelectInput.vue";
import { PIECE_GENRES } from "@/types";

const genreOptions = PIECE_GENRES.map((v) => ({ value: v, label: v }));

const meta: Meta<typeof SelectInput> = {
  title: "Atoms/SelectInput",
  component: SelectInput,
};

export default meta;
type Story = StoryObj<typeof SelectInput>;

export const Default: Story = {
  args: { modelValue: "", options: genreOptions },
};

export const WithPlaceholder: Story = {
  args: { modelValue: "", options: genreOptions, placeholder: "ジャンルを選択" },
};

export const WithValue: Story = {
  args: { modelValue: "交響曲", options: genreOptions },
};
