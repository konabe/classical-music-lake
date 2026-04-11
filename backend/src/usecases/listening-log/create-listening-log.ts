import { buildListeningLog } from "../../domain/listening-log";
import * as listeningLogRepository from "../../repositories/listening-log-repository";
import type { CreateListeningLogInput, ListeningLog } from "../../types";

export const createListeningLog = async (input: CreateListeningLogInput): Promise<ListeningLog> => {
  const log = buildListeningLog(input);
  await listeningLogRepository.save(log);
  return log;
};
