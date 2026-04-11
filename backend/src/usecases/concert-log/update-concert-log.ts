import createError from "http-errors";

import { isOwner } from "../../domain/concert-log";
import * as concertLogRepository from "../../repositories/concert-log-repository";
import type { ConcertLog } from "../../types";

export const updateConcertLog = async (
  id: string,
  input: Partial<ConcertLog>,
  userId: string
): Promise<ConcertLog> => {
  const existing = await concertLogRepository.findById(id);
  if (existing === undefined || !isOwner(existing, userId)) {
    throw new createError.NotFound("Concert log not found");
  }
  return concertLogRepository.update(id, input);
};
