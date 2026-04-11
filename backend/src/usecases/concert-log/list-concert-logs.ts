import { sortByConcertDateDesc } from "../../domain/concert-log";
import * as concertLogRepository from "../../repositories/concert-log-repository";
import type { ConcertLog } from "../../types";

export const listConcertLogs = async (userId: string): Promise<ConcertLog[]> => {
  const logs = await concertLogRepository.findByUserId(userId);
  return sortByConcertDateDesc(logs);
};
