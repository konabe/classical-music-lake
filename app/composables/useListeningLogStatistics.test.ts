import { computeStatistics, useListeningLogStatistics } from "./useListeningLogStatistics";
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

describe("computeStatistics", () => {
  it("空配列のとき総数 0・平均 0 を返す", () => {
    const stats = computeStatistics([]);
    expect(stats.total).toBe(0);
    expect(stats.favoriteCount).toBe(0);
    expect(stats.averageRating).toBe(0);
    expect(stats.topComposers).toEqual([]);
    expect(stats.monthlyTrend).toEqual([]);
    expect(stats.ratingDistribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  it("総数・お気に入り数・平均評価を集計する", () => {
    const stats = computeStatistics([
      log({ id: "1", rating: 5, isFavorite: true }),
      log({ id: "2", rating: 3, isFavorite: false }),
      log({ id: "3", rating: 4, isFavorite: true }),
    ]);
    expect(stats.total).toBe(3);
    expect(stats.favoriteCount).toBe(2);
    expect(stats.averageRating).toBeCloseTo(4);
  });

  it("評価分布をカウントする", () => {
    const stats = computeStatistics([
      log({ id: "1", rating: 5 }),
      log({ id: "2", rating: 5 }),
      log({ id: "3", rating: 3 }),
    ]);
    expect(stats.ratingDistribution[5]).toBe(2);
    expect(stats.ratingDistribution[3]).toBe(1);
    expect(stats.ratingDistribution[1]).toBe(0);
  });

  it("作曲家トップを件数降順で返す", () => {
    const stats = computeStatistics(
      [
        log({ id: "1", composerName: "ベートーヴェン" }),
        log({ id: "2", composerName: "ベートーヴェン" }),
        log({ id: "3", composerName: "モーツァルト" }),
        log({ id: "4", composerName: "ブラームス" }),
        log({ id: "5", composerName: "ブラームス" }),
        log({ id: "6", composerName: "ブラームス" }),
      ],
      { topComposerLimit: 2 },
    );
    expect(stats.topComposers).toEqual([
      { composerName: "ブラームス", count: 3 },
      { composerName: "ベートーヴェン", count: 2 },
    ]);
  });

  it("月別の集計を時系列順で返す", () => {
    const stats = computeStatistics([
      log({ id: "1", listenedAt: "2024-01-05T00:00:00.000Z" }),
      log({ id: "2", listenedAt: "2024-01-20T00:00:00.000Z" }),
      log({ id: "3", listenedAt: "2024-03-10T00:00:00.000Z" }),
    ]);
    expect(stats.monthlyTrend).toEqual([
      { month: "2024-01", count: 2 },
      { month: "2024-03", count: 1 },
    ]);
  });
});

describe("useListeningLogStatistics", () => {
  it("logs が null/undefined のとき空集計を返す", () => {
    const logs = ref<ListeningLog[] | null>(null);
    const { statistics } = useListeningLogStatistics(logs);
    expect(statistics.value.total).toBe(0);
  });
});
