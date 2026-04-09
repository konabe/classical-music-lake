import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import YouTubeThumbnail from "./YouTubeThumbnail.vue";

const meta: Meta<typeof YouTubeThumbnail> = {
  title: "Atoms/YouTubeThumbnail",
  component: YouTubeThumbnail,
};

export default meta;
type Story = StoryObj<typeof YouTubeThumbnail>;

export const WithYouTubeUrl: Story = {
  args: {
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    alt: "サンプル動画のサムネイル",
  },
};

export const WithShortYouTubeUrl: Story = {
  args: {
    videoUrl: "https://youtu.be/dQw4w9WgXcQ",
    alt: "サンプル動画のサムネイル",
  },
};

export const WithNonYouTubeUrl: Story = {
  args: {
    videoUrl: "https://example.com/video.mp4",
    alt: "サムネイル",
  },
};

export const WithoutVideoUrl: Story = {
  args: {
    videoUrl: undefined,
    alt: "サムネイル",
  },
};
