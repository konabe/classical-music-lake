import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { PieceMovement } from "@/types";
import MovementListItem from "@/components/molecules/MovementListItem.vue";

const meta: Meta<typeof MovementListItem> = {
  title: "Molecules/MovementListItem",
  component: MovementListItem,
};

export default meta;
type Story = StoryObj<typeof MovementListItem>;

const baseMovement: PieceMovement = {
  kind: "movement",
  id: "movement-1",
  parentId: "work-1",
  index: 0,
  title: "第1楽章 Allegro ma non troppo",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const Default: Story = {
  args: { movement: baseMovement },
};

export const WithYouTubeVideo: Story = {
  args: {
    movement: {
      ...baseMovement,
      videoUrls: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
    },
  },
};

export const WithMultipleYouTubeVideos: Story = {
  args: {
    movement: {
      ...baseMovement,
      videoUrls: [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://www.youtube.com/watch?v=abc123",
      ],
    },
  },
};

export const WithExternalUrl: Story = {
  args: {
    movement: {
      ...baseMovement,
      videoUrls: ["https://example.com/video.mp4"],
    },
  },
};

export const WithMixedVideoUrls: Story = {
  args: {
    movement: {
      ...baseMovement,
      videoUrls: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://example.com/video.mp4"],
    },
  },
};

export const TenthMovement: Story = {
  args: {
    movement: { ...baseMovement, id: "movement-10", index: 9, title: "第10楽章" },
  },
};
