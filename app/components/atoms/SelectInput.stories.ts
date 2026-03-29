import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import SelectInput from "./SelectInput.vue";

const genreOptions = [
  { value: "交響曲", label: "交響曲" },
  { value: "協奏曲", label: "協奏曲" },
  { value: "室内楽", label: "室内楽" },
  { value: "独奏曲", label: "独奏曲" },
  { value: "歌曲", label: "歌曲" },
  { value: "オペラ", label: "オペラ" },
  { value: "宗教音楽", label: "宗教音楽" },
  { value: "その他", label: "その他" },
];

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
