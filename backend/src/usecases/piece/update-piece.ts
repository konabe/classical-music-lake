import createError from "http-errors";

import { mergePieceUpdate } from "../../domain/piece";
import * as pieceRepository from "../../repositories/piece-repository";
import type { Piece, UpdatePieceInput } from "../../types";

export const updatePiece = async (id: string, input: UpdatePieceInput): Promise<Piece> => {
  const current = await pieceRepository.findById(id);
  if (current === undefined) {
    throw new createError.NotFound("Piece not found");
  }
  const updated = mergePieceUpdate(current, input);
  await pieceRepository.saveWithOptimisticLock(updated, current.updatedAt);
  return updated;
};
