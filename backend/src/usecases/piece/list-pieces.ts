import { sortPiecesByTitleJa } from "../../domain/piece";
import * as pieceRepository from "../../repositories/piece-repository";
import type { Piece } from "../../types";

export const listPieces = async (): Promise<Piece[]> => {
  const pieces = await pieceRepository.findAll();
  return sortPiecesByTitleJa(pieces);
};
