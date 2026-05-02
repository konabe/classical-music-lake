import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ComposersTemplate from "./ComposersTemplate.vue";
import type { Composer } from "~/types";

const meta: Meta<typeof ComposersTemplate> = {
  title: "Templates/ComposersTemplate",
  component: ComposersTemplate,
};

export default meta;
type Story = StoryObj<typeof ComposersTemplate>;

const sample: Composer[] = [
  {
    id: "1",
    name: "ベートーヴェン",
    era: "古典派",
    createdAt: "2024-06-01T00:00:00.000Z",
    updatedAt: "2024-06-01T00:00:00.000Z",
  },
];

export const AsAdmin: Story = {
  args: { composers: sample, error: null, pending: false, isAdmin: true },
};

export const AsVisitor: Story = {
  args: { composers: sample, error: null, pending: false, isAdmin: false },
};

export const Empty: Story = {
  args: { composers: [], error: null, pending: false, isAdmin: true },
};
