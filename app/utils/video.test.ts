import { isYouTubeUrl, extractYouTubeVideoId, toYouTubeEmbedUrl } from "./video";

describe("isYouTubeUrl", () => {
  it("youtube.com/watch?v= を含む URL は true", () => {
    expect(isYouTubeUrl("https://www.youtube.com/watch?v=abc123")).toBe(true);
  });

  it("youtu.be/ を含む URL は true", () => {
    expect(isYouTubeUrl("https://youtu.be/abc123")).toBe(true);
  });

  it("YouTube でない URL は false", () => {
    expect(isYouTubeUrl("https://vimeo.com/abc123")).toBe(false);
  });

  it("空文字列は false", () => {
    expect(isYouTubeUrl("")).toBe(false);
  });
});

describe("extractYouTubeVideoId", () => {
  it("youtube.com/watch?v=VIDEO_ID から videoId を抽出する", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=abc123")).toBe("abc123");
  });

  it("クエリパラメータが複数ある場合も videoId を抽出する", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=abc123&t=60")).toBe("abc123");
  });

  it("youtu.be/VIDEO_ID から videoId を抽出する", () => {
    expect(extractYouTubeVideoId("https://youtu.be/abc123")).toBe("abc123");
  });

  it("YouTube でない URL は null を返す", () => {
    expect(extractYouTubeVideoId("https://vimeo.com/abc123")).toBeNull();
  });
});

describe("toYouTubeEmbedUrl", () => {
  it("youtube.com URL を embed URL に変換する", () => {
    expect(toYouTubeEmbedUrl("https://www.youtube.com/watch?v=abc123")).toBe(
      "https://www.youtube.com/embed/abc123?enablejsapi=1&rel=0&fs=0"
    );
  });

  it("youtu.be URL を embed URL に変換する", () => {
    expect(toYouTubeEmbedUrl("https://youtu.be/abc123")).toBe(
      "https://www.youtube.com/embed/abc123?enablejsapi=1&rel=0&fs=0"
    );
  });
});
