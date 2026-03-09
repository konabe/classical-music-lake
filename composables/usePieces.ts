import type { Piece } from "~/types";

export const usePieces = () => {
  const apiBase = useApiBase();
  return useFetch<Piece[]>(`${apiBase}/pieces`);
};
