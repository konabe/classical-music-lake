import * as pieceRepository from "../../repositories/piece-repository";

export const deletePiece = async (id: string): Promise<void> => {
  await pieceRepository.remove(id);
};
