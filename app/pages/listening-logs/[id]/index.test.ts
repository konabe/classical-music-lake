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

vi.mock("~/composables/useListeningLogs", () => ({
  useListeningLog: () => ({ data: sampleLog, error: null, pending: false }),
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
});
