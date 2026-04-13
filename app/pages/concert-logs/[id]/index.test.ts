import { mountSuspended } from "@nuxt/test-utils/runtime";
import ConcertLogDetailPage from "./index.vue";
import type { ConcertLog } from "~/types";

const sampleLog: ConcertLog = {
  id: "cl-123",
  userId: "user-1",
  title: "ベルリン・フィル 来日公演",
  concertDate: "2024-03-01T19:00:00.000Z",
  venue: "サントリーホール",
  conductor: "カラヤン",
  orchestra: "ベルリン・フィルハーモニー管弦楽団",
  createdAt: "2024-03-01T20:00:00.000Z",
  updatedAt: "2024-03-01T20:00:00.000Z",
};

vi.mock("~/composables/useConcertLogs", () => ({
  useConcertLog: () => ({ data: sampleLog, error: null, pending: false }),
  useConcertLogs: () => ({
    data: null,
    error: null,
    pending: false,
    refresh: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteLog: vi.fn(),
  }),
}));

vi.mock("~/composables/usePieces", () => ({
  usePiecesPaginated: () => ({
    items: ref([]),
    nextCursor: ref(null),
    pending: ref(false),
    error: ref(null),
    hasMore: ref(true),
    loadMore: vi.fn(),
    reset: vi.fn(),
    retry: vi.fn(),
    createPiece: vi.fn(),
    updatePiece: vi.fn(),
  }),
  usePiecesAll: () => ({
    data: ref([]),
    error: ref(null),
    pending: ref(false),
    refresh: vi.fn(),
    createPiece: vi.fn(),
    updatePiece: vi.fn(),
  }),
  usePiece: () => ({ data: null, error: null }),
}));

describe("ConcertLogDetailPage", () => {
  it("コンサート詳細が表示される", async () => {
    const wrapper = await mountSuspended(ConcertLogDetailPage);
    expect(wrapper.text()).toContain("ベルリン・フィル 来日公演");
  });
});
