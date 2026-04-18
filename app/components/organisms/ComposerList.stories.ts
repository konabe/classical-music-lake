import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ComposerList from "./ComposerList.vue";
import type { Composer } from "~/types";

const meta: Meta<typeof ComposerList> = {
  title: "Organisms/ComposerList",
  component: ComposerList,
};

export default meta;
type Story = StoryObj<typeof ComposerList>;

const sampleComposers: Composer[] = [
  {
    id: "1",
    name: "ベートーヴェン",
    era: "古典派",
    region: "ドイツ・オーストリア",
    createdAt: "2024-06-01T00:00:00.000Z",
    updatedAt: "2024-06-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "モーツァルト",
    era: "古典派",
    region: "ドイツ・オーストリア",
    createdAt: "2024-06-01T00:00:00.000Z",
    updatedAt: "2024-06-01T00:00:00.000Z",
  },
];

export const Default: Story = {
  args: { composers: sampleComposers, error: null },
};

export const Empty: Story = {
  args: { composers: [], error: null },
};

export const ErrorState: Story = {
  args: { composers: [], error: new Error("取得失敗") },
};
