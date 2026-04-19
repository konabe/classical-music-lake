import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ListeningLogsPage from "./index.vue";
import type { ListeningLog } from "~/types";

const mockDeleteLog = vi.fn();
const mockRefresh = vi.fn();

const sampleLogs: ListeningLog[] = [
  {
    id: "log-001",
    userId: null,
    listenedAt: "2024-03-01T14:00:00.000Z",
    composer: "ベートーヴェン",
    piece: "交響曲第9番 ニ短調 Op.125",
    rating: 5,
    isFavorite: false,
    createdAt: "2024-03-01T14:00:00.000Z",
    updatedAt: "2024-03-01T14:00:00.000Z",
  },
  {
    id: "log-002",
    userId: null,
    listenedAt: "2024-03-02T10:00:00.000Z",
    composer: "モーツァルト",
    piece: "魔笛",
    rating: 4,
    isFavorite: true,
    createdAt: "2024-03-02T10:00:00.000Z",
    updatedAt: "2024-03-02T10:00:00.000Z",
  },
];

vi.mock("~/composables/useListeningLogs", () => {
  return {
    useListeningLogs: () => {
      return {
        data: sampleLogs,
        error: null,
        pending: false,
        refresh: mockRefresh,
        create: vi.fn(),
        update: vi.fn(),
        deleteLog: mockDeleteLog,
      };
    },
  };
});

beforeEach(() => {
  mockDeleteLog.mockClear();
  mockRefresh.mockClear();
  vi.stubGlobal(
    "confirm",
    vi.fn(() => {
      return true;
    })
  );
});

describe("ListeningLogsPage（削除フロー結合）", () => {
  it("削除ボタンが各アイテムに表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogsPage);
    const deleteButtons = wrapper.findAll(".btn-danger");
    expect(deleteButtons).toHaveLength(2);
  });

  it("1件目の削除ボタンをクリックすると confirm が表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogsPage);
    await wrapper.findAll(".btn-danger")[0].trigger("click");
    expect(globalThis.confirm).toHaveBeenCalledWith("この記録を削除しますか？");
  });

  it("1件目の削除ボタンをクリックすると log-001 の deleteLog が呼ばれる", async () => {
    mockDeleteLog.mockResolvedValue(undefined);
    const wrapper = await mountSuspended(ListeningLogsPage);
    await wrapper.findAll(".btn-danger")[0].trigger("click");
    await flushPromises();
    expect(mockDeleteLog).toHaveBeenCalledWith("log-001");
  });

  it("2件目の削除ボタンをクリックすると log-002 の deleteLog が呼ばれる", async () => {
    mockDeleteLog.mockResolvedValue(undefined);
    const wrapper = await mountSuspended(ListeningLogsPage);
    await wrapper.findAll(".btn-danger")[1].trigger("click");
    await flushPromises();
    expect(mockDeleteLog).toHaveBeenCalledWith("log-002");
  });

  it("削除後に refresh が呼ばれる", async () => {
    mockDeleteLog.mockResolvedValue(undefined);
    const wrapper = await mountSuspended(ListeningLogsPage);
    await wrapper.findAll(".btn-danger")[0].trigger("click");
    await flushPromises();
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("キャンセル時は deleteLog が呼ばれない", async () => {
    vi.stubGlobal(
      "confirm",
      vi.fn(() => {
        return false;
      })
    );
    const wrapper = await mountSuspended(ListeningLogsPage);
    await wrapper.findAll(".btn-danger")[0].trigger("click");
    expect(mockDeleteLog).not.toHaveBeenCalled();
  });
});
