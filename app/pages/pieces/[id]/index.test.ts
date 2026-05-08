import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import PieceDetailPage from "./index.vue";
import type { Composer, ListeningLog, Piece, Rating } from "~/types";

vi.mock("~/composables/useAuth", () => ({
  ACCESS_TOKEN_KEY: "accessToken",
  useAuth: vi.fn(),
}));

const mockCreate = vi.fn();
const mockExecute = vi.fn().mockResolvedValue(undefined);
const mockRefresh = vi.fn().mockResolvedValue(undefined);

const COMPOSER_ID = "00000000-0000-4000-8000-000000000001";
const PIECE_ID = "piece-1";

const samplePiece: Piece = {
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
    composer: "別の作曲家", // composer 文字列が違っても pieceId 一致なので含まれる
    piece: "別の曲名",
    pieceId: PIECE_ID,
    rating: 5,
    isFavorite: false,
    createdAt: "2024-04-01T10:00:00.000Z",
    updatedAt: "2024-04-01T10:00:00.000Z",
  },
  {
    id: "log-pieceId-match-2",
    userId: "user-1",
    listenedAt: "2024-02-01T10:00:00.000Z",
    composer: "ベートーヴェン",
    piece: "交響曲第9番",
    pieceId: PIECE_ID,
    rating: 3,
    isFavorite: false,
    createdAt: "2024-02-01T10:00:00.000Z",
    updatedAt: "2024-02-01T10:00:00.000Z",
  },
  {
    id: "log-pieceId-mismatch",
    userId: "user-1",
    listenedAt: "2024-03-01T10:00:00.000Z",
    composer: "ベートーヴェン",
    piece: "交響曲第9番", // 文字列は一致するが pieceId が違うので除外
    pieceId: "other-piece-id",
    rating: 4,
    isFavorite: false,
    createdAt: "2024-03-01T10:00:00.000Z",
    updatedAt: "2024-03-01T10:00:00.000Z",
  },
  {
    id: "log-no-pieceId",
    userId: "user-1",
    listenedAt: "2024-02-15T10:00:00.000Z",
    composer: "ベートーヴェン",
    piece: "交響曲第9番", // 文字列が一致しても pieceId が無いので除外（フォールバックなし）
    rating: 3,
    isFavorite: false,
    createdAt: "2024-02-15T10:00:00.000Z",
    updatedAt: "2024-02-15T10:00:00.000Z",
  },
];

vi.mock("~/composables/usePieces", () => ({
  usePiecesPaginated: vi.fn(),
  usePiecesAll: vi.fn(),
  usePiece: () => ({ data: ref(samplePiece), error: ref(null) }),
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

beforeEach(async () => {
  mockCreate.mockClear();
  mockExecute.mockClear();
  mockRefresh.mockClear();
  listeningLogsData.value = [];
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
        composer: "ベートーヴェン",
        piece: "交響曲第9番",
        pieceId: PIECE_ID,
        rating: 5,
        isFavorite: true,
        memo: "最高",
      }),
    );
  });

  describe("鑑賞記録一覧の絞り込み", () => {
    it("pieceId が一致するログを含む（composer/piece 文字列が違っても）", async () => {
      listeningLogsData.value = sampleLogs;
      const wrapper = await mountSuspended(PieceDetailPage);
      await flushPromises();
      const template = wrapper.findComponent({ name: "PieceDetailTemplate" });
      const logs = template.props("listeningLogs") as ListeningLog[];
      const ids = logs.map((l) => l.id);
      expect(ids).toContain("log-pieceId-match-1");
      expect(ids).toContain("log-pieceId-match-2");
    });

    it("pieceId が異なるログは文字列が一致しても除外する", async () => {
      listeningLogsData.value = sampleLogs;
      const wrapper = await mountSuspended(PieceDetailPage);
      await flushPromises();
      const template = wrapper.findComponent({ name: "PieceDetailTemplate" });
      const logs = template.props("listeningLogs") as ListeningLog[];
      const ids = logs.map((l) => l.id);
      expect(ids).not.toContain("log-pieceId-mismatch");
    });

    it("pieceId が未設定のログは文字列が一致しても除外する（フォールバックなし）", async () => {
      listeningLogsData.value = sampleLogs;
      const wrapper = await mountSuspended(PieceDetailPage);
      await flushPromises();
      const template = wrapper.findComponent({ name: "PieceDetailTemplate" });
      const logs = template.props("listeningLogs") as ListeningLog[];
      const ids = logs.map((l) => l.id);
      expect(ids).not.toContain("log-no-pieceId");
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
});
