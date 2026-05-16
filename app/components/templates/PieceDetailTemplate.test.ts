import { mountSuspended } from "@nuxt/test-utils/runtime";
import PieceDetailTemplate from "@/components/templates/PieceDetailTemplate.vue";
import type { ListeningLog, PieceMovement, PieceWork } from "@/types";

const pieceWithVideo: PieceWork = {
  kind: "work",
  id: "1",
  title: "交響曲第9番 ニ短調 Op.125",
  composerId: "00000000-0000-4000-8000-000000000001",
  videoUrls: ["https://www.youtube.com/watch?v=abc123"],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const pieceWithMultipleVideos: PieceWork = {
  kind: "work",
  id: "4",
  title: "交響曲第9番 ニ短調 Op.125",
  composerId: "00000000-0000-4000-8000-000000000001",
  videoUrls: [
    "https://www.youtube.com/watch?v=abc123",
    "https://www.youtube.com/watch?v=def456",
    "https://www.youtube.com/watch?v=ghi789",
  ],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const pieceWithCategories: PieceWork = {
  kind: "work",
  id: "3",
  title: "春の祭典",
  composerId: "00000000-0000-4000-8000-000000000003",
  genre: "その他",
  era: "近現代",
  formation: "管弦楽",
  region: "ロシア",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const pieceWithoutVideo: PieceWork = {
  kind: "work",
  id: "2",
  title: "魔笛",
  composerId: "00000000-0000-4000-8000-000000000002",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const movementSample: PieceMovement = {
  kind: "movement",
  id: "movement-1",
  parentId: "1",
  index: 0,
  title: "第1楽章 Allegro ma non troppo",
  videoUrls: ["https://www.youtube.com/watch?v=mov1"],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("PieceDetailTemplate", () => {
  describe("videoUrls あり（単一）", () => {
    it("曲名が表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.text()).toContain("交響曲第9番 ニ短調 Op.125");
    });

    it("作曲家が表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.text()).toContain("ベートーヴェン");
    });

    it("VideoPlayer が表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".video-player").exists()).toBe(true);
    });

    it("再生前は QuickLogForm が表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".quick-log-form").exists()).toBe(false);
    });

    it("iframe の src に autoplay パラメータが含まれない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find("iframe").attributes("src")).not.toContain("autoplay");
    });
  });

  describe("videoUrls 複数", () => {
    it("動画 URL の数だけ VideoPlayer が表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithMultipleVideos,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.findAll(".video-player").length).toBe(3);
    });

    it("動画ごとに序数（N° 01 等）が表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithMultipleVideos,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.text()).toContain("N° 01");
      expect(wrapper.text()).toContain("N° 02");
      expect(wrapper.text()).toContain("N° 03");
    });
  });

  describe("videoUrls なし", () => {
    it("曲名が表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.text()).toContain("魔笛");
    });

    it("VideoPlayer が表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".video-player").exists()).toBe(false);
    });

    it("QuickLogForm が表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".quick-log-form").exists()).toBe(false);
    });
  });

  describe("エラー表示", () => {
    it("error が null でない場合はエラーメッセージが表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: null,
          error: new Error("取得失敗"),
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".error-message").exists()).toBe(true);
    });
  });

  describe("カテゴリ表示", () => {
    it("genre が設定されている場合、ジャンルバッジが表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithCategories,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".kind-genre .badge-value").text()).toBe("その他");
    });

    it("genre が未設定の場合、ジャンルバッジが表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".kind-genre").exists()).toBe(false);
    });

    it("全カテゴリが未設定の場合、バッジが一切表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".piece-category-list").exists()).toBe(false);
    });
  });

  describe("管理者向け操作", () => {
    it("isAdmin が true のとき編集・削除ボタンが表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: true,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".admin-actions").exists()).toBe(true);
      expect(wrapper.find("a.admin-link").exists()).toBe(true);
      expect(wrapper.find(".admin-link--danger").exists()).toBe(true);
    });

    it("isAdmin が false のとき編集・削除ボタンが表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".admin-actions").exists()).toBe(false);
    });

    it("削除ボタンクリックで delete イベントが emit される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: true,
          composerName: "ベートーヴェン",
        },
      });
      await wrapper.find(".admin-link--danger").trigger("click");
      expect(wrapper.emitted("delete")).toBeDefined();
    });

    it("編集リンクが正しい href を持つ", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: true,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find("a.admin-link").attributes("href")).toBe("/pieces/2/edit");
    });
  });

  describe("鑑賞記録一覧", () => {
    const sampleLogs: ListeningLog[] = [
      {
        id: "log-1",
        userId: "user-1",
        listenedAt: "2024-03-10T12:00:00.000Z",
        composer: "モーツァルト",
        piece: "魔笛",
        rating: 5,
        isFavorite: true,
        memo: "夜の女王のアリアが圧巻",
        createdAt: "2024-03-10T12:00:00.000Z",
        updatedAt: "2024-03-10T12:00:00.000Z",
      },
      {
        id: "log-2",
        userId: "user-1",
        listenedAt: "2024-02-01T08:30:00.000Z",
        composer: "モーツァルト",
        piece: "魔笛",
        rating: 4,
        isFavorite: false,
        createdAt: "2024-02-01T08:30:00.000Z",
        updatedAt: "2024-02-01T08:30:00.000Z",
      },
    ];

    it("listeningLogs を渡すと Listening records セクションが表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "モーツァルト",
          listeningLogs: sampleLogs,
        },
      });
      expect(wrapper.find(".piece-listenings").exists()).toBe(true);
      expect(wrapper.text()).toContain("あなたの鑑賞記録");
    });

    it("各鑑賞記録が詳細ページへのリンクを持つ", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "モーツァルト",
          listeningLogs: sampleLogs,
        },
      });
      const links = wrapper.findAll(".listenings-link");
      expect(links.length).toBe(2);
      expect(links[0].attributes("href")).toBe("/listening-logs/log-1");
      expect(links[1].attributes("href")).toBe("/listening-logs/log-2");
    });

    it("件数表示が件数に応じて切り替わる（複数件は entries）", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "モーツァルト",
          listeningLogs: sampleLogs,
        },
      });
      expect(wrapper.find(".listenings-count").text()).toContain("entries");
    });

    it("件数表示が件数に応じて切り替わる（1件は entry）", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "モーツァルト",
          listeningLogs: [sampleLogs[0]],
        },
      });
      expect(wrapper.find(".listenings-count").text()).toContain("entry");
    });

    it("listeningLogs が空配列の場合、Listening records セクションが表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "モーツァルト",
          listeningLogs: [],
        },
      });
      expect(wrapper.find(".piece-listenings").exists()).toBe(false);
    });

    it("listeningLogs が未指定の場合、Listening records セクションが表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "モーツァルト",
        },
      });
      expect(wrapper.find(".piece-listenings").exists()).toBe(false);
    });
  });

  describe("楽章一覧（Movements）", () => {
    it("Work かつ movements が指定されると Movements セクションが表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
          movements: [movementSample],
        },
      });
      expect(wrapper.find(".piece-movements").exists()).toBe(true);
      expect(wrapper.text()).toContain("第1楽章 Allegro ma non troppo");
    });

    it("movements が空配列の場合 Movements セクションは表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
          movements: [],
        },
      });
      expect(wrapper.find(".piece-movements").exists()).toBe(false);
    });

    it("movements が未指定の場合 Movements セクションは表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".piece-movements").exists()).toBe(false);
    });

    it("Movement を直接開いた場合は Movements セクションは表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: movementSample,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
          movements: [movementSample],
        },
      });
      expect(wrapper.find(".piece-movements").exists()).toBe(false);
    });
  });

  describe("Movement 詳細とパンくず", () => {
    it("Movement かつ parentWork が渡されると親 Work へのパンくずが表示される", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: movementSample,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
          parentWork: pieceWithoutVideo,
        },
      });
      const link = wrapper.find(".breadcrumb-link");
      expect(link.exists()).toBe(true);
      expect(link.attributes("href")).toBe("/pieces/2");
      expect(link.text()).toContain("魔笛");
    });

    it("Work の場合パンくずは表示されない", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: pieceWithoutVideo,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
        },
      });
      expect(wrapper.find(".breadcrumb-link").exists()).toBe(false);
    });

    it("Movement の場合 PieceCategoryList は表示されない（カテゴリは Work に紐付くため）", async () => {
      const wrapper = await mountSuspended(PieceDetailTemplate, {
        props: {
          piece: movementSample,
          error: null,
          isAdmin: false,
          composerName: "ベートーヴェン",
          parentWork: pieceWithCategories,
        },
      });
      expect(wrapper.find(".piece-category-list").exists()).toBe(false);
    });
  });
});
