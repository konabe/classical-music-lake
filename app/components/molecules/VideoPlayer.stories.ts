import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import VideoPlayer from "@/components/molecules/VideoPlayer.vue";

const meta: Meta<typeof VideoPlayer> = {
  title: "Molecules/VideoPlayer",
  component: VideoPlayer,
};

export default meta;
type Story = StoryObj<typeof VideoPlayer>;

export const YouTube: Story = {
  args: {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
};

export const ExternalLink: Story = {
  args: {
    videoUrl: "https://example.com/video",
  },
};
