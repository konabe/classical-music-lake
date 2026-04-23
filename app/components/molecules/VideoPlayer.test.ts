import { mountSuspended } from "@nuxt/test-utils/runtime";
import VideoPlayer from "./VideoPlayer.vue";

const youtubeUrl = "https://www.youtube.com/watch?v=abc123";
const nonYoutubeUrl = "https://example.com/video";

describe("VideoPlayer", () => {
  describe("YouTube URL の場合", () => {
    it("iframe が表示される", async () => {
      const wrapper = await mountSuspended(VideoPlayer, {
        props: { videoUrl: youtubeUrl },
      });
      expect(wrapper.find("iframe").exists()).toBe(true);
    });

    it("embed URL が src に設定される", async () => {
      const wrapper = await mountSuspended(VideoPlayer, {
        props: { videoUrl: youtubeUrl },
      });
      expect(wrapper.find("iframe").attributes("src")).toContain(
        "https://www.youtube.com/embed/abc123"
      );
    });

    it("外部リンクは表示されない", async () => {
      const wrapper = await mountSuspended(VideoPlayer, {
        props: { videoUrl: youtubeUrl },
      });
      expect(wrapper.find("a.external-link").exists()).toBe(false);
    });

    it("embed URL に autoplay パラメータが含まれない", async () => {
      const wrapper = await mountSuspended(VideoPlayer, {
        props: { videoUrl: youtubeUrl },
      });
      expect(wrapper.find("iframe").attributes("src")).not.toContain("autoplay");
    });
  });

  describe("非 YouTube URL の場合", () => {
    it("外部リンクが表示される", async () => {
      const wrapper = await mountSuspended(VideoPlayer, {
        props: { videoUrl: nonYoutubeUrl },
      });
      expect(wrapper.find("a.external-link").exists()).toBe(true);
    });

    it("iframe は表示されない", async () => {
      const wrapper = await mountSuspended(VideoPlayer, {
        props: { videoUrl: nonYoutubeUrl },
      });
      expect(wrapper.find("iframe").exists()).toBe(false);
    });

    it("リンクをクリックすると play イベントが emit される", async () => {
      const wrapper = await mountSuspended(VideoPlayer, {
        props: { videoUrl: nonYoutubeUrl },
      });
      await wrapper.find("a.external-link").trigger("click");
      expect(wrapper.emitted("play")).toBeDefined();
    });
  });
});
