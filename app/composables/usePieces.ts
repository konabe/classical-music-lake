import type { CreatePieceInput, Piece, UpdatePieceInput } from "~/types";

export const usePieces = () => {
  const apiBase = useApiBase();
  const list = useFetch<Piece[]>(`${apiBase}/pieces`);

  const createPiece = (input: CreatePieceInput) =>
    $fetch<Piece>(`${apiBase}/pieces`, { method: "POST", body: input });

  const updatePiece = (id: string, input: UpdatePieceInput) =>
    $fetch<Piece>(`${apiBase}/pieces/${id}`, { method: "PUT", body: input });

  return { ...list, createPiece, updatePiece };
};

export const usePiece = (id: () => string) => {
  const apiBase = useApiBase();
  return useFetch<Piece>(() => `${apiBase}/pieces/${id()}`);
};
