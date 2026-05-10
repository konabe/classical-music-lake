import { filterListeningLogs, useListeningLogFilter } from "./useListeningLogFilter";
import type { ListeningLog } from "~/types";

const log = (overrides: Partial<ListeningLog> = {}): ListeningLog => ({
  id: "log-1",
  userId: "user-1",
  listenedAt: "2024-01-15T19:30:00.000Z",
  pieceId: "piece-1",
  pieceTitle: "交響曲第9番",
  composerId: "composer-1",
  composerName: "ベートーヴェン",
  rating: 5,
  isFavorite: false,
  memo: undefined,
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
  ...overrides,
});

describe("filterListeningLogs", () => {
  const logs: ListeningLog[] = [
    log({
      id: "1",
      composerName: "ベートーヴェン",
      pieceTitle: "交響曲第9番",
      rating: 5,
      isFavorite: true,
    }),
    log({
      id: "2",
      composerName: "モーツァルト",
      pieceTitle: "魔笛",
      rating: 3,
      isFavorite: false,
      memo: "鳥と夜",
      listenedAt: "2024-03-10T18:00:00.000Z",
    }),
    log({
      id: "3",
      composerName: "ブラームス",
      pieceTitle: "交響曲第4番",
      rating: 4,
      isFavorite: true,
      listenedAt: "2024-06-01T19:00:00.000Z",
    }),
  ];

  it("キーワードで作曲家・曲名・メモを横断検索する", () => {
    expect(filterListeningLogs(logs, makeState({ keyword: "交響曲" })).map((l) => l.id)).toEqual([
      "1",
      "3",
    ]);
    expect(filterListeningLogs(logs, makeState({ keyword: "鳥" })).map((l) => l.id)).toEqual(["2"]);
  });

  it("評価でフィルタする", () => {
    expect(filterListeningLogs(logs, makeState({ rating: "4" })).map((l) => l.id)).toEqual(["3"]);
  });

  it("お気に入りのみに絞り込む", () => {
    expect(filterListeningLogs(logs, makeState({ favoriteOnly: true })).map((l) => l.id)).toEqual([
      "1",
      "3",
    ]);
  });

  it("日付範囲でフィルタする", () => {
    const result = filterListeningLogs(
      logs,
      makeState({ fromDate: "2024-02-01", toDate: "2024-04-30" }),
    );
    expect(result.map((l) => l.id)).toEqual(["2"]);
  });

  it("条件を組み合わせて AND で評価する", () => {
    const result = filterListeningLogs(
      logs,
      makeState({ keyword: "交響曲", favoriteOnly: true, rating: "4" }),
    );
    expect(result.map((l) => l.id)).toEqual(["3"]);
  });
});

describe("useListeningLogFilter", () => {
  it("isActive はフィルタ未設定時 false、設定時 true", () => {
    const logs = ref<ListeningLog[]>([log()]);
    const { state, isActive } = useListeningLogFilter(logs);
    expect(isActive.value).toBe(false);
    state.value.keyword = "ベー";
    expect(isActive.value).toBe(true);
  });

  it("reset で初期状態に戻る", () => {
    const logs = ref<ListeningLog[]>([log()]);
    const { state, reset, isActive } = useListeningLogFilter(logs);
    state.value.keyword = "X";
    state.value.favoriteOnly = true;
    expect(isActive.value).toBe(true);
    reset();
    expect(isActive.value).toBe(false);
    expect(state.value.keyword).toBe("");
    expect(state.value.favoriteOnly).toBe(false);
  });

  it("logs が null/undefined のとき空配列を返す", () => {
    const logs = ref<ListeningLog[] | null>(null);
    const { filteredLogs } = useListeningLogFilter(logs);
    expect(filteredLogs.value).toEqual([]);
  });
});

function makeState(
  overrides: Partial<ReturnType<typeof useListeningLogFilter>["state"]["value"]> = {},
): ReturnType<typeof useListeningLogFilter>["state"]["value"] {
  return {
    keyword: "",
    rating: "",
    favoriteOnly: false,
    fromDate: "",
    toDate: "",
    ...overrides,
  };
}
