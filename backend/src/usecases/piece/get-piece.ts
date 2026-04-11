import createError from "http-errors";

import * as pieceRepository from "../../repositories/piece-repository";
import type { Piece } from "../../types";

export const getPiece = async (id: string): Promise<Piece> => {
  const piece = await pieceRepository.findById(id);
  if (piece === undefined) {
    throw new createError.NotFound("Piece not found");
  }
  return piece;
};
