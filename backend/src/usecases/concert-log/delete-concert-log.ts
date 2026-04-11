import createError from "http-errors";

import { isOwner } from "../../domain/concert-log";
import * as concertLogRepository from "../../repositories/concert-log-repository";

export const deleteConcertLog = async (id: string, userId: string): Promise<void> => {
  const existing = await concertLogRepository.findById(id);
  if (existing === undefined || !isOwner(existing, userId)) {
    throw new createError.NotFound("Concert log not found");
  }
  await concertLogRepository.remove(id);
};
