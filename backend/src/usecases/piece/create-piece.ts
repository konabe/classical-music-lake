import { buildPiece } from "../../domain/piece";
import * as pieceRepository from "../../repositories/piece-repository";
import type { CreatePieceInput, Piece } from "../../types";

export const createPiece = async (input: CreatePieceInput): Promise<Piece> => {
  const piece = buildPiece(input);
  await pieceRepository.save(piece);
  return piece;
};
