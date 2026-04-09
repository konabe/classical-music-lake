import { mountSuspended } from "@nuxt/test-utils/runtime";
import YouTubeThumbnail from "./YouTubeThumbnail.vue";

describe("YouTubeThumbnail", () => {
  describe("表示", () => {
    it("標準形式の YouTube URL の場合、img が描画される", async () => {
      const wrapper = await mountSuspended(YouTubeThumbnail, {
        props: {
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          alt: "サンプル動画のサムネイル",
        },
      });
      const img = wrapper.find("img.youtube-thumbnail");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toContain("img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg");
    });

    it("短縮形式の YouTube URL の場合、img が描画される", async () => {
      const wrapper = await mountSuspended(YouTubeThumbnail, {
        props: {
          videoUrl: "https://youtu.be/dQw4w9WgXcQ",
          alt: "サンプル動画のサムネイル",
        },
      });
      const img = wrapper.find("img.youtube-thumbnail");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toContain("img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg");
    });

    it("alt prop が img の alt 属性に反映される", async () => {
      const wrapper = await mountSuspended(YouTubeThumbnail, {
        props: {
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          alt: "魔笛 の動画サムネイル",
        },
      });
      expect(wrapper.find("img").attributes("alt")).toBe("魔笛 の動画サムネイル");
    });

    it("videoUrl が undefined の場合、img が描画されない", async () => {
      const wrapper = await mountSuspended(YouTubeThumbnail, {
        props: {
          videoUrl: undefined,
          alt: "サムネイル",
        },
      });
      expect(wrapper.find("img").exists()).toBe(false);
    });

    it("YouTube 以外の URL の場合、img が描画されない", async () => {
      const wrapper = await mountSuspended(YouTubeThumbnail, {
        props: {
          videoUrl: "https://example.com/video.mp4",
          alt: "サムネイル",
        },
      });
      expect(wrapper.find("img").exists()).toBe(false);
    });

    it("width / height 属性がアスペクト比 16:9 で設定されている", async () => {
      const wrapper = await mountSuspended(YouTubeThumbnail, {
        props: {
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          alt: "サムネイル",
        },
      });
      const img = wrapper.find("img");
      expect(img.attributes("width")).toBe("160");
      expect(img.attributes("height")).toBe("90");
    });

    it("loading=lazy と decoding=async が設定されている", async () => {
      const wrapper = await mountSuspended(YouTubeThumbnail, {
        props: {
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          alt: "サムネイル",
        },
      });
      const img = wrapper.find("img");
      expect(img.attributes("loading")).toBe("lazy");
      expect(img.attributes("decoding")).toBe("async");
    });
  });

  describe("エラー処理", () => {
    it("画像ロードエラー時に img が非表示になる", async () => {
      const wrapper = await mountSuspended(YouTubeThumbnail, {
        props: {
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          alt: "サムネイル",
        },
      });
      expect(wrapper.find("img").exists()).toBe(true);
      await wrapper.find("img").trigger("error");
      expect(wrapper.find("img").exists()).toBe(false);
    });
  });
});
