import createError from "http-errors";

import { isOwner } from "../../domain/listening-log";
import * as listeningLogRepository from "../../repositories/listening-log-repository";

export const deleteListeningLog = async (id: string, userId: string): Promise<void> => {
  const existing = await listeningLogRepository.findById(id);
  if (existing === undefined || !isOwner(existing, userId)) {
    throw new createError.NotFound("Listening log not found");
  }
  await listeningLogRepository.remove(id);
};
