import { mountSuspended } from "@nuxt/test-utils/runtime";
import MovementListItem from "./MovementListItem.vue";
import type { PieceMovement } from "~/types";

const baseMovement: PieceMovement = {
  kind: "movement",
  id: "movement-1",
  parentId: "work-1",
  index: 0,
  title: "第1楽章 Allegro ma non troppo",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("MovementListItem", () => {
  describe("表示", () => {
    it("楽章名が表示される", async () => {
      const wrapper = await mountSuspended(MovementListItem, {
        props: { movement: baseMovement },
      });
      expect(wrapper.text()).toContain("第1楽章 Allegro ma non troppo");
    });

    it("index は 1 始まりで 2 桁ゼロ埋め表示される", async () => {
      const wrapper = await mountSuspended(MovementListItem, {
        props: { movement: { ...baseMovement, index: 0 } },
      });
      expect(wrapper.find(".movement-index").text()).toContain("01");
    });

    it("index が 2 桁の値でも 2 桁表示される", async () => {
      const wrapper = await mountSuspended(MovementListItem, {
        props: { movement: { ...baseMovement, index: 11 } },
      });
      expect(wrapper.find(".movement-index").text()).toContain("12");
    });
  });

  describe("YouTube URL の動画埋め込み", () => {
    it("YouTube URL の場合、iframe 埋め込みが描画される", async () => {
      const movement: PieceMovement = {
        ...baseMovement,
        videoUrls: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
      };
      const wrapper = await mountSuspended(MovementListItem, { props: { movement } });
      const iframe = wrapper.find(".movement-iframe");
      expect(iframe.exists()).toBe(true);
      expect(iframe.attributes("src")).toBe(
        "https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1&rel=0&fs=0",
      );
    });

    it("短縮形式の YouTube URL でも iframe 埋め込みが描画される", async () => {
      const movement: PieceMovement = {
        ...baseMovement,
        videoUrls: ["https://youtu.be/dQw4w9WgXcQ"],
      };
      const wrapper = await mountSuspended(MovementListItem, { props: { movement } });
      const iframe = wrapper.find(".movement-iframe");
      expect(iframe.exists()).toBe(true);
      expect(iframe.attributes("src")).toBe(
        "https://www.youtube.com/embed/dQw4w9WgXcQ?enablejsapi=1&rel=0&fs=0",
      );
    });

    it("複数の YouTube URL が含まれる場合、複数の iframe が描画される", async () => {
      const movement: PieceMovement = {
        ...baseMovement,
        videoUrls: ["https://www.youtube.com/watch?v=aaa", "https://www.youtube.com/watch?v=bbb"],
      };
      const wrapper = await mountSuspended(MovementListItem, { props: { movement } });
      expect(wrapper.findAll(".movement-iframe")).toHaveLength(2);
    });

    it("YouTube 以外の URL は外部リンクとして描画される", async () => {
      const movement: PieceMovement = {
        ...baseMovement,
        videoUrls: ["https://example.com/video.mp4"],
      };
      const wrapper = await mountSuspended(MovementListItem, { props: { movement } });
      expect(wrapper.find(".movement-iframe").exists()).toBe(false);
      const link = wrapper.find(".external-link");
      expect(link.exists()).toBe(true);
      expect(link.attributes("href")).toBe("https://example.com/video.mp4");
    });

    it("YouTube URL と外部 URL が混在する場合、両方が描画される", async () => {
      const movement: PieceMovement = {
        ...baseMovement,
        videoUrls: ["https://www.youtube.com/watch?v=aaa", "https://example.com/video.mp4"],
      };
      const wrapper = await mountSuspended(MovementListItem, { props: { movement } });
      expect(wrapper.findAll(".movement-iframe")).toHaveLength(1);
      expect(wrapper.findAll(".external-link")).toHaveLength(1);
    });

    it("videoUrls が未設定の場合、iframe も外部リンクも描画されない", async () => {
      const wrapper = await mountSuspended(MovementListItem, {
        props: { movement: baseMovement },
      });
      expect(wrapper.find(".movement-iframe").exists()).toBe(false);
      expect(wrapper.find(".external-link").exists()).toBe(false);
    });

    it("videoUrls が空配列の場合、iframe も外部リンクも描画されない", async () => {
      const movement: PieceMovement = { ...baseMovement, videoUrls: [] };
      const wrapper = await mountSuspended(MovementListItem, { props: { movement } });
      expect(wrapper.find(".movement-iframe").exists()).toBe(false);
      expect(wrapper.find(".external-link").exists()).toBe(false);
    });
  });
});
