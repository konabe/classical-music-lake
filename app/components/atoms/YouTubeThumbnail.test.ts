import { mountSuspended } from "@nuxt/test-utils/runtime";
import YouTubeThumbnail from "./YouTubeThumbnail.vue";

const VIDEO_ID = "dQw4w9WgXcQ";
const STANDARD_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const SHORT_URL = `https://youtu.be/${VIDEO_ID}`;
const SAMPLE_ALT = "サンプル動画のサムネイル";

const mount = (videoUrl: string | undefined, alt: string = SAMPLE_ALT) =>
  mountSuspended(YouTubeThumbnail, { props: { videoUrl, alt } });

describe("YouTubeThumbnail", () => {
  describe("表示", () => {
    it("標準形式の YouTube URL の場合、img が描画される", async () => {
      const wrapper = await mount(STANDARD_URL);
      const img = wrapper.find("img.youtube-thumbnail");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toContain(`img.youtube.com/vi/${VIDEO_ID}/mqdefault.jpg`);
    });

    it("短縮形式の YouTube URL の場合、img が描画される", async () => {
      const wrapper = await mount(SHORT_URL);
      const img = wrapper.find("img.youtube-thumbnail");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toContain(`img.youtube.com/vi/${VIDEO_ID}/mqdefault.jpg`);
    });

    it("alt prop が img の alt 属性に反映される", async () => {
      const wrapper = await mount(STANDARD_URL, "魔笛 の動画サムネイル");
      expect(wrapper.find("img").attributes("alt")).toBe("魔笛 の動画サムネイル");
    });

    it("videoUrl が undefined の場合、img が描画されない", async () => {
      const wrapper = await mount(undefined);
      expect(wrapper.find("img").exists()).toBe(false);
    });

    it("YouTube 以外の URL の場合、img が描画されない", async () => {
      const wrapper = await mount("https://example.com/video.mp4");
      expect(wrapper.find("img").exists()).toBe(false);
    });

    it("width / height 属性がアスペクト比 16:9 で設定されている", async () => {
      const wrapper = await mount(STANDARD_URL);
      const img = wrapper.find("img");
      expect(img.attributes("width")).toBe("160");
      expect(img.attributes("height")).toBe("90");
    });

    it("loading=lazy と decoding=async が設定されている", async () => {
      const wrapper = await mount(STANDARD_URL);
      const img = wrapper.find("img");
      expect(img.attributes("loading")).toBe("lazy");
      expect(img.attributes("decoding")).toBe("async");
    });
  });

  describe("エラー処理", () => {
    it("画像ロードエラー時に img が非表示になる", async () => {
      const wrapper = await mount(STANDARD_URL);
      expect(wrapper.find("img").exists()).toBe(true);
      await wrapper.find("img").trigger("error");
      expect(wrapper.find("img").exists()).toBe(false);
    });
  });
});
