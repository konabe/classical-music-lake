import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ComposerListInfinite from "./ComposerListInfinite.vue";
import type { Composer } from "~/types";

const meta: Meta<typeof ComposerListInfinite> = {
  title: "Organisms/ComposerListInfinite",
  component: ComposerListInfinite,
};

export default meta;
type Story = StoryObj<typeof ComposerListInfinite>;

const sampleComposers: Composer[] = [
  {
    id: "1",
    name: "ベートーヴェン",
    era: "古典派",
    createdAt: "2024-06-01T00:00:00.000Z",
    updatedAt: "2024-06-01T00:00:00.000Z",
  },
];

export const Default: Story = {
  args: { composers: sampleComposers, error: null, pending: false, hasMore: true },
};

export const Pending: Story = {
  args: { composers: sampleComposers, error: null, pending: true, hasMore: true },
};

export const NoMore: Story = {
  args: { composers: sampleComposers, error: null, pending: false, hasMore: false },
};

export const ErrorState: Story = {
  args: { composers: [], error: new Error("取得失敗"), pending: false, hasMore: true },
};
