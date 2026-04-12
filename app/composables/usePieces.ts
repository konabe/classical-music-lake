import type { CreatePieceInput, Piece, UpdatePieceInput } from "~/types";

export const usePieces = () => {
  const apiBase = useApiBase();
  const list = useFetch<Piece[]>(`${apiBase}/pieces`);

  const createPiece = async (input: CreatePieceInput) => {
    const result = await $fetch<Piece>(`${apiBase}/pieces`, { method: "POST", body: input });
    clearNuxtData();
    return result;
  };

  const updatePiece = async (id: string, input: UpdatePieceInput) => {
    const result = await $fetch<Piece>(`${apiBase}/pieces/${id}`, { method: "PUT", body: input });
    clearNuxtData();
    return result;
  };

  const { data, pending, error, refresh, execute, status } = list;
  return { data, pending, error, refresh, execute, status, createPiece, updatePiece };
};

export const usePiece = (id: () => string) => {
  const apiBase = useApiBase();
  return useFetch<Piece>(() => `${apiBase}/pieces/${id()}`);
};
