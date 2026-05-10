import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import PieceDetailPage from "./index.vue";
import type { Composer, ListeningLog, PieceWork, Rating } from "~/types";

vi.mock("~/composables/useAuth", () => ({
  ACCESS_TOKEN_KEY: "accessToken",
  useAuth: vi.fn(),
}));

const mockCreate = vi.fn();
const mockExecute = vi.fn().mockResolvedValue(undefined);
const mockRefresh = vi.fn().mockResolvedValue(undefined);

const COMPOSER_ID = "00000000-0000-4000-8000-000000000001";
const PIECE_ID = "piece-1";

const samplePiece: PieceWork = {
  kind: "work",
  id: PIECE_ID,
  title: "交響曲第9番",
  composerId: COMPOSER_ID,
  videoUrls: ["https://www.youtube.com/watch?v=abc123"],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const sampleComposers: Composer[] = [
  {
    id: COMPOSER_ID,
    name: "ベートーヴェン",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

const sampleLogs: ListeningLog[] = [
  {
    id: "log-pieceId-match-1",
    userId: "user-1",
    listenedAt: "2024-04-01T10:00:00.000Z",
    pieceId: PIECE_ID,
    pieceTitle: "交響曲第9番",
    composerId: COMPOSER_ID,
    composerName: "ベートーヴェン",
    rating: 5,
    isFavorite: false,
    createdAt: "2024-04-01T10:00:00.000Z",
    updatedAt: "2024-04-01T10:00:00.000Z",
  },
  {
    id: "log-pieceId-match-2",
    userId: "user-1",
    listenedAt: "2024-02-01T10:00:00.000Z",
    pieceId: PIECE_ID,
    pieceTitle: "交響曲第9番",
    composerId: COMPOSER_ID,
    composerName: "ベートーヴェン",
    rating: 3,
    isFavorite: false,
    createdAt: "2024-02-01T10:00:00.000Z",
    updatedAt: "2024-02-01T10:00:00.000Z",
  },
  {
    id: "log-pieceId-mismatch",
    userId: "user-1",
    listenedAt: "2024-03-01T10:00:00.000Z",
    pieceId: "other-piece-id",
    pieceTitle: "交響曲第9番",
    composerId: COMPOSER_ID,
    composerName: "ベートーヴェン",
    rating: 4,
    isFavorite: false,
    createdAt: "2024-03-01T10:00:00.000Z",
    updatedAt: "2024-03-01T10:00:00.000Z",
  },
];

const usePieceData = ref<PieceWork | import("~/types").PieceMovement | null>(samplePiece);

vi.mock("~/composables/usePieces", () => ({
  usePiecesPaginated: vi.fn(),
  usePiecesAll: vi.fn(),
  usePiece: () => ({ data: usePieceData, error: ref(null) }),
}));

vi.mock("~/composables/useComposers", () => ({
  useComposer: vi.fn(),
  useComposersAll: () => ({
    data: ref(sampleComposers),
    error: ref(null),
    pending: ref(false),
    refresh: vi.fn().mockResolvedValue(undefined),
  }),
}));

const listeningLogsData = ref<ListeningLog[]>([]);

vi.mock("~/composables/useListeningLogs", () => ({
  useListeningLogs: () => ({
    data: listeningLogsData,
    error: ref(null),
    pending: ref(false),
    execute: mockExecute,
    refresh: mockRefresh,
    create: mockCreate,
    update: vi.fn(),
    deleteLog: vi.fn(),
  }),
  useListeningLog: () => ({ data: ref(null), error: ref(null) }),
  useListeningLogCreate: () => ({ create: mockCreate }),
}));

const mockDollarFetch = vi.fn();

beforeEach(async () => {
  mockCreate.mockClear();
  mockExecute.mockClear();
  mockRefresh.mockClear();
  listeningLogsData.value = [];
  mockDollarFetch.mockReset();
  // 楽章一覧 / 親 Work の取得は空配列・null を返すデフォルトモック
  mockDollarFetch.mockResolvedValue([]);
  vi.stubGlobal("$fetch", mockDollarFetch);
  // デフォルトは Work
  usePieceData.value = samplePiece;
  const { useAuth } = await import("~/composables/useAuth");
  vi.mocked(useAuth).mockReturnValue({
    isAdmin: () => false,
    isAuthenticated: () => true,
  } as unknown as ReturnType<typeof useAuth>);
});

describe("PieceDetailPage", () => {
  it("PieceDetailTemplate が表示される", async () => {
    const wrapper = await mountSuspended(PieceDetailPage);
    expect(wrapper.findComponent({ name: "PieceDetailTemplate" }).exists()).toBe(true);
  });

  it("handleSave が呼ばれると create が pieceId 込みで実行される", async () => {
    mockCreate.mockResolvedValue({ id: "log-new" });
    const wrapper = await mountSuspended(PieceDetailPage);
    const vm = wrapper.vm as {
      handleSave: (values: { rating: Rating; isFavorite: boolean; memo: string }) => Promise<void>;
    };
    await vm.handleSave({ rating: 5, isFavorite: true, memo: "最高" });
    await flushPromises();
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        pieceId: PIECE_ID,
        rating: 5,
        isFavorite: true,
        memo: "最高",
      }),
    );
    // composer / piece は新スキーマで送信されない（バックエンドが派生）
    const arg = mockCreate.mock.calls[0]?.[0];
    expect(arg).not.toHaveProperty("composer");
    expect(arg).not.toHaveProperty("piece");
  });

  describe("鑑賞記録一覧の絞り込み", () => {
    it("pieceId が一致するログを含む", async () => {
      listeningLogsData.value = sampleLogs;
      const wrapper = await mountSuspended(PieceDetailPage);
      await flushPromises();
      const template = wrapper.findComponent({ name: "PieceDetailTemplate" });
      const logs = template.props("listeningLogs") as ListeningLog[];
      const ids = logs.map((l) => l.id);
      expect(ids).toContain("log-pieceId-match-1");
      expect(ids).toContain("log-pieceId-match-2");
    });

    it("pieceId が異なるログは除外する", async () => {
      listeningLogsData.value = sampleLogs;
      const wrapper = await mountSuspended(PieceDetailPage);
      await flushPromises();
      const template = wrapper.findComponent({ name: "PieceDetailTemplate" });
      const logs = template.props("listeningLogs") as ListeningLog[];
      const ids = logs.map((l) => l.id);
      expect(ids).not.toContain("log-pieceId-mismatch");
    });

    it("listenedAt 降順でソートされる", async () => {
      listeningLogsData.value = sampleLogs;
      const wrapper = await mountSuspended(PieceDetailPage);
      await flushPromises();
      const template = wrapper.findComponent({ name: "PieceDetailTemplate" });
      const logs = template.props("listeningLogs") as ListeningLog[];
      const ids = logs.map((l) => l.id);
      expect(ids).toEqual(["log-pieceId-match-1", "log-pieceId-match-2"]);
    });

    it("未認証時は鑑賞記録を取得せず空配列を渡す", async () => {
      const { useAuth } = await import("~/composables/useAuth");
      vi.mocked(useAuth).mockReturnValue({
        isAdmin: () => false,
        isAuthenticated: () => false,
      } as unknown as ReturnType<typeof useAuth>);
      listeningLogsData.value = sampleLogs;
      const wrapper = await mountSuspended(PieceDetailPage);
      await flushPromises();
      const template = wrapper.findComponent({ name: "PieceDetailTemplate" });
      const logs = template.props("listeningLogs") as ListeningLog[];
      expect(logs).toEqual([]);
      expect(mockExecute).not.toHaveBeenCalled();
    });
  });

  describe("楽章一覧（Work）", () => {
    it("Work の場合 GET /pieces/{id}/children を呼んで movements にセットする", async () => {
      const sampleMovements: import("~/types").PieceMovement[] = [
        {
          kind: "movement",
          id: "movement-1",
          parentId: PIECE_ID,
          index: 0,
          title: "第1楽章",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ];
      mockDollarFetch.mockImplementation((url: string) => {
        if (url.endsWith(`/pieces/${PIECE_ID}/children`)) {
          return Promise.resolve(sampleMovements);
        }
        return Promise.resolve([]);
      });
      const wrapper = await mountSuspended(PieceDetailPage);
      await flushPromises();
      const template = wrapper.findComponent({ name: "PieceDetailTemplate" });
      const movements = template.props("movements") as import("~/types").PieceMovement[];
      expect(movements).toHaveLength(1);
      expect(movements[0].id).toBe("movement-1");
    });
  });

  describe("Movement 詳細", () => {
    const PARENT_ID = "parent-work";
    const MOVEMENT_ID = "movement-99";
    const movementSample: import("~/types").PieceMovement = {
      kind: "movement",
      id: MOVEMENT_ID,
      parentId: PARENT_ID,
      index: 1,
      title: "第2楽章 Andante",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };
    const parentWorkSample: PieceWork = {
      kind: "work",
      id: PARENT_ID,
      title: "ピアノ協奏曲第1番",
      composerId: COMPOSER_ID,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    beforeEach(() => {
      usePieceData.value = movementSample;
      mockDollarFetch.mockImplementation((url: string) => {
        if (url.endsWith(`/pieces/${PARENT_ID}`)) {
          return Promise.resolve(parentWorkSample);
        }
        return Promise.resolve([]);
      });
    });

    it("Movement の場合 GET /pieces/{parentId} を呼んで親 Work を解決する", async () => {
      const wrapper = await mountSuspended(PieceDetailPage);
      await flushPromises();
      const template = wrapper.findComponent({ name: "PieceDetailTemplate" });
      const parentWork = template.props("parentWork") as PieceWork | null;
      expect(parentWork?.id).toBe(PARENT_ID);
    });

    it("Movement の場合 composerName は親 Work の composerId から解決される", async () => {
      const wrapper = await mountSuspended(PieceDetailPage);
      await flushPromises();
      const template = wrapper.findComponent({ name: "PieceDetailTemplate" });
      expect(template.props("composerName")).toBe("ベートーヴェン");
    });

    it("Movement の場合 quickLogPieceLabel が「親 Work title - 楽章 title」になる", async () => {
      const wrapper = await mountSuspended(PieceDetailPage);
      await flushPromises();
      const template = wrapper.findComponent({ name: "PieceDetailTemplate" });
      expect(template.props("quickLogPieceLabel")).toBe("ピアノ協奏曲第1番 - 第2楽章 Andante");
    });

    it("Movement で handleSave を呼ぶと create の pieceId に movementId が渡る", async () => {
      mockCreate.mockResolvedValue({ id: "log-new" });
      const wrapper = await mountSuspended(PieceDetailPage);
      await flushPromises();
      const vm = wrapper.vm as {
        handleSave: (values: {
          rating: Rating;
          isFavorite: boolean;
          memo: string;
        }) => Promise<void>;
      };
      await vm.handleSave({ rating: 4, isFavorite: false, memo: "" });
      await flushPromises();
      // pieceTitle / composerName はサーバ側で派生するためフロントは送らない
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ pieceId: MOVEMENT_ID }));
    });
  });
});
