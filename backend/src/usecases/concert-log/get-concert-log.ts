import createError from "http-errors";

import { isOwner } from "../../domain/concert-log";
import * as concertLogRepository from "../../repositories/concert-log-repository";
import type { ConcertLog } from "../../types";

export const getConcertLog = async (id: string, userId: string): Promise<ConcertLog> => {
  const log = await concertLogRepository.findById(id);
  if (log === undefined || !isOwner(log, userId)) {
    throw new createError.NotFound("Concert log not found");
  }
  return log;
};
