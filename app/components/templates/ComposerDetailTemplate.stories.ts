import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ComposerDetailTemplate from "./ComposerDetailTemplate.vue";
import type { Composer } from "~/types";

const meta: Meta<typeof ComposerDetailTemplate> = {
  title: "Templates/ComposerDetailTemplate",
  component: ComposerDetailTemplate,
};

export default meta;
type Story = StoryObj<typeof ComposerDetailTemplate>;

const sample: Composer = {
  id: "1",
  name: "ベートーヴェン",
  era: "古典派",
  region: "ドイツ・オーストリア",
  createdAt: "2024-06-01T00:00:00.000Z",
  updatedAt: "2024-06-01T00:00:00.000Z",
};

export const AsAdmin: Story = {
  args: { composer: sample, error: null, isAdmin: true },
};

export const AsVisitor: Story = {
  args: { composer: sample, error: null, isAdmin: false },
};

export const ErrorState: Story = {
  args: { composer: null, error: new Error("fail"), isAdmin: false },
};
