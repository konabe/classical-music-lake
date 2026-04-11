import { buildConcertLog } from "../../domain/concert-log";
import * as concertLogRepository from "../../repositories/concert-log-repository";
import type { ConcertLog, CreateConcertLogInput } from "../../types";

export const createConcertLog = async (
  input: CreateConcertLogInput,
  userId: string
): Promise<ConcertLog> => {
  const log = buildConcertLog(input, userId);
  await concertLogRepository.save(log);
  return log;
};
