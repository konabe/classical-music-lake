import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ListeningLogDetailPage from "./index.vue";
import type { ListeningLog } from "~/types";

vi.mock("~/composables/useAuth", () => ({
  ACCESS_TOKEN_KEY: "accessToken",
  useAuth: vi.fn(),
}));

const mockDeleteLog = vi.fn();

const sampleLog: ListeningLog = {
  id: "log-123",
  userId: null,
  listenedAt: "2024-03-01T14:00:00.000Z",
  composer: "ベートーヴェン",
  piece: "交響曲第9番 ニ短調 Op.125",
  rating: 5,
  isFavorite: false,
  createdAt: "2024-03-01T14:00:00.000Z",
  updatedAt: "2024-03-01T14:00:00.000Z",
};

const initialPieceId = sampleLog.pieceId;

vi.mock("~/composables/useListeningLogs", () => ({
  useListeningLog: () => ({ data: ref(sampleLog), error: null, pending: false }),
  useListeningLogs: () => ({
    data: null,
    error: null,
    pending: false,
    refresh: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteLog: mockDeleteLog,
  }),
}));

beforeEach(() => {
  mockDeleteLog.mockClear();
  sampleLog.pieceId = initialPieceId;
  vi.stubGlobal(
    "confirm",
    vi.fn(() => true),
  );
});

describe("ListeningLogDetailPage（結合）", () => {
  it("削除ボタンが表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogDetailPage);
    expect(wrapper.find(".btn-danger").exists()).toBe(true);
  });

  it("削除ボタンをクリックすると deleteLog が呼ばれる", async () => {
    mockDeleteLog.mockResolvedValue(undefined);
    const wrapper = await mountSuspended(ListeningLogDetailPage);
    await wrapper.find(".btn-danger").trigger("click");
    await flushPromises();
    expect(mockDeleteLog).toHaveBeenCalledWith("log-123");
  });

  it("削除後に鑑賞記録一覧へ遷移する", async () => {
    mockDeleteLog.mockResolvedValue(undefined);
    const wrapper = await mountSuspended(ListeningLogDetailPage);
    const pushSpy = vi.spyOn(wrapper.vm.$router, "push");
    await wrapper.find(".btn-danger").trigger("click");
    await flushPromises();
    expect(pushSpy).toHaveBeenCalledWith("/listening-logs");
  });

  it("キャンセル時は deleteLog が呼ばれない", async () => {
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false),
    );
    const wrapper = await mountSuspended(ListeningLogDetailPage);
    await wrapper.find(".btn-danger").trigger("click");
    expect(mockDeleteLog).not.toHaveBeenCalled();
  });

  describe("楽曲マスタへのリンク", () => {
    it("log.pieceId が設定されていればリンクが表示される", async () => {
      sampleLog.pieceId = "piece-from-log";
      const wrapper = await mountSuspended(ListeningLogDetailPage);
      const link = wrapper.find(".piece-link");
      expect(link.attributes("href")).toBe("/pieces/piece-from-log");
    });

    it("log.pieceId が未設定の場合はリンクが表示されない", async () => {
      sampleLog.pieceId = undefined;
      const wrapper = await mountSuspended(ListeningLogDetailPage);
      expect(wrapper.find(".piece-link").exists()).toBe(false);
    });
  });
});
