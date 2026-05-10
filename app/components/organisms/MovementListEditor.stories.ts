import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { PieceMovement } from "~/types";
import MovementListEditor from "./MovementListEditor.vue";

const meta: Meta<typeof MovementListEditor> = {
  title: "Organisms/MovementListEditor",
  component: MovementListEditor,
};

export default meta;
type Story = StoryObj<typeof MovementListEditor>;

const sampleMovements: PieceMovement[] = [
  {
    kind: "movement",
    id: "mov-1",
    parentId: "work-1",
    index: 0,
    title: "第一楽章 アレグロ・コン・ブリオ",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    kind: "movement",
    id: "mov-2",
    parentId: "work-1",
    index: 1,
    title: "第二楽章 アンダンテ・コン・モート",
    videoUrls: ["https://www.youtube.com/watch?v=abc123"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    kind: "movement",
    id: "mov-3",
    parentId: "work-1",
    index: 2,
    title: "第三楽章 スケルツォ",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    kind: "movement",
    id: "mov-4",
    parentId: "work-1",
    index: 3,
    title: "第四楽章 アレグロ",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

export const Default: Story = {
  args: { workId: "work-1", initialMovements: sampleMovements },
};

export const Empty: Story = {
  args: { workId: "work-1", initialMovements: [] },
};
