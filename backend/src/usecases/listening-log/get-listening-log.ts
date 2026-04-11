import createError from "http-errors";

import { isOwner } from "../../domain/listening-log";
import * as listeningLogRepository from "../../repositories/listening-log-repository";
import type { ListeningLog } from "../../types";

export const getListeningLog = async (id: string, userId: string): Promise<ListeningLog> => {
  const log = await listeningLogRepository.findById(id);
  if (log === undefined || !isOwner(log, userId)) {
    throw new createError.NotFound("Listening log not found");
  }
  return log;
};
