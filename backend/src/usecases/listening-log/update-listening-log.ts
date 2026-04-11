import createError from "http-errors";

import { isOwner } from "../../domain/listening-log";
import * as listeningLogRepository from "../../repositories/listening-log-repository";
import type { ListeningLog } from "../../types";

export const updateListeningLog = async (
  id: string,
  input: Partial<ListeningLog>,
  userId: string
): Promise<ListeningLog> => {
  const existing = await listeningLogRepository.findById(id);
  if (existing === undefined || !isOwner(existing, userId)) {
    throw new createError.NotFound("Listening log not found");
  }
  return listeningLogRepository.update(id, input);
};
