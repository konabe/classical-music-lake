import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ComposerEditTemplate from "./ComposerEditTemplate.vue";
import type { Composer } from "~/types";

const meta: Meta<typeof ComposerEditTemplate> = {
  title: "Templates/ComposerEditTemplate",
  component: ComposerEditTemplate,
};

export default meta;
type Story = StoryObj<typeof ComposerEditTemplate>;

const sample: Composer = {
  id: "1",
  name: "ベートーヴェン",
  era: "古典派",
  region: "ドイツ・オーストリア",
  createdAt: "2024-06-01T00:00:00.000Z",
  updatedAt: "2024-06-01T00:00:00.000Z",
};

export const Default: Story = {
  args: { composer: sample, fetchError: null, errorMessage: "" },
};

export const WithError: Story = {
  args: { composer: sample, fetchError: null, errorMessage: "更新に失敗しました" },
};

export const FetchError: Story = {
  args: { composer: null, fetchError: new Error("fail"), errorMessage: "" },
};
