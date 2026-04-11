import { sortByListenedAtDesc } from "../../domain/listening-log";
import * as listeningLogRepository from "../../repositories/listening-log-repository";
import type { ListeningLog } from "../../types";

export const listListeningLogs = async (userId: string): Promise<ListeningLog[]> => {
  const logs = await listeningLogRepository.findByUserId(userId);
  return sortByListenedAtDesc(logs);
};
