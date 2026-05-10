import type { Ref } from "vue";
import type { ListeningLog, Rating } from "~/types";

export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

export type ComposerCount = {
  composerName: string;
  count: number;
};

export type MonthlyCount = {
  month: string;
  count: number;
};

export type ListeningLogStatistics = {
  total: number;
  favoriteCount: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  topComposers: ComposerCount[];
  monthlyTrend: MonthlyCount[];
};

const RATINGS: ReadonlySet<Rating> = new Set([1, 2, 3, 4, 5]);

const emptyRatingDistribution = (): RatingDistribution => ({
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
});

const formatMonth = (iso: string): string | null => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const computeStatistics = (
  logs: ListeningLog[],
  options: { topComposerLimit?: number; monthlyTrendLimit?: number } = {},
): ListeningLogStatistics => {
  const topComposerLimit = options.topComposerLimit ?? 5;
  const monthlyTrendLimit = options.monthlyTrendLimit ?? 12;

  const total = logs.length;
  const favoriteCount = logs.filter((log) => log.isFavorite).length;

  const ratingDistribution = emptyRatingDistribution();
  let ratingSum = 0;
  for (const log of logs) {
    if (RATINGS.has(log.rating)) {
      ratingDistribution[log.rating] += 1;
      ratingSum += log.rating;
    }
  }
  const averageRating = total === 0 ? 0 : ratingSum / total;

  const composerMap = new Map<string, number>();
  for (const log of logs) {
    composerMap.set(log.composerName, (composerMap.get(log.composerName) ?? 0) + 1);
  }
  const topComposers: ComposerCount[] = [...composerMap.entries()]
    .map(([composerName, count]) => ({ composerName, count }))
    .sort((a, b) => {
      const diff = b.count - a.count;
      return diff === 0 ? a.composerName.localeCompare(b.composerName) : diff;
    })
    .slice(0, topComposerLimit);

  const monthlyMap = new Map<string, number>();
  for (const log of logs) {
    const month = formatMonth(log.listenedAt);
    if (month === null) {
      continue;
    }
    monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + 1);
  }
  const monthlyTrend: MonthlyCount[] = [...monthlyMap.entries()]
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-monthlyTrendLimit);

  return {
    total,
    favoriteCount,
    averageRating,
    ratingDistribution,
    topComposers,
    monthlyTrend,
  };
};

export const useListeningLogStatistics = (
  logs: Ref<ListeningLog[] | null | undefined>,
  options: { topComposerLimit?: number; monthlyTrendLimit?: number } = {},
) => {
  const statistics = computed(() => computeStatistics(logs.value ?? [], options));
  return { statistics };
};
