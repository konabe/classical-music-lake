import type { Ref } from "vue";
import type { ListeningLog, Rating } from "@/types";

export type ListeningLogFilterState = {
  keyword: string;
  rating: "" | `${Rating}`;
  favoriteOnly: boolean;
  fromDate: string;
  toDate: string;
};

const createInitialState = (): ListeningLogFilterState => ({
  keyword: "",
  rating: "",
  favoriteOnly: false,
  fromDate: "",
  toDate: "",
});

const matchesKeyword = (log: ListeningLog, keyword: string): boolean => {
  const needle = keyword.trim().toLowerCase();
  if (needle.length === 0) {
    return true;
  }
  const haystack = [log.composerName, log.pieceTitle, log.memo ?? ""].join(" ").toLowerCase();
  return haystack.includes(needle);
};

const matchesRating = (log: ListeningLog, rating: ListeningLogFilterState["rating"]): boolean => {
  if (rating === "") {
    return true;
  }
  return log.rating === Number(rating);
};

const matchesFavorite = (log: ListeningLog, favoriteOnly: boolean): boolean => {
  if (!favoriteOnly) {
    return true;
  }
  return log.isFavorite;
};

const matchesDateRange = (log: ListeningLog, fromDate: string, toDate: string): boolean => {
  const listened = new Date(log.listenedAt).getTime();
  if (Number.isNaN(listened)) {
    return false;
  }
  if (fromDate.length > 0) {
    const from = new Date(`${fromDate}T00:00:00`).getTime();
    if (listened < from) {
      return false;
    }
  }
  if (toDate.length > 0) {
    const to = new Date(`${toDate}T23:59:59.999`).getTime();
    if (listened > to) {
      return false;
    }
  }
  return true;
};

export const filterListeningLogs = (
  logs: ListeningLog[],
  state: ListeningLogFilterState,
): ListeningLog[] =>
  logs.filter(
    (log) =>
      matchesKeyword(log, state.keyword) &&
      matchesRating(log, state.rating) &&
      matchesFavorite(log, state.favoriteOnly) &&
      matchesDateRange(log, state.fromDate, state.toDate),
  );

export const useListeningLogFilter = (logs: Ref<ListeningLog[] | null | undefined>) => {
  const state = ref<ListeningLogFilterState>(createInitialState());

  const filteredLogs = computed(() => filterListeningLogs(logs.value ?? [], state.value));

  const isActive = computed(() => {
    const s = state.value;
    return (
      s.keyword.length > 0 ||
      s.rating !== "" ||
      s.favoriteOnly ||
      s.fromDate.length > 0 ||
      s.toDate.length > 0
    );
  });

  const reset = () => {
    state.value = createInitialState();
  };

  return { state, filteredLogs, isActive, reset };
};
