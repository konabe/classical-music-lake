import { randomUUID } from "node:crypto";

import type { CreateListeningLogInput, ListeningLog } from "../types";

export const buildListeningLog = (input: CreateListeningLogInput): ListeningLog => {
  const now = new Date().toISOString();
  return { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
};

export const sortByListenedAtDesc = (logs: ListeningLog[]): ListeningLog[] =>
  [...logs].sort((a, b) => b.listenedAt.localeCompare(a.listenedAt));

export const isOwner = (log: ListeningLog, userId: string): boolean => log.userId === userId;
