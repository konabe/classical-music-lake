import { randomUUID } from "node:crypto";

import type { ConcertLog, CreateConcertLogInput } from "../types";

export const buildConcertLog = (input: CreateConcertLogInput, userId: string): ConcertLog => {
  const now = new Date().toISOString();
  return { ...input, id: randomUUID(), userId, createdAt: now, updatedAt: now };
};

export const sortByConcertDateDesc = (logs: ConcertLog[]): ConcertLog[] =>
  [...logs].sort((a, b) => b.concertDate.localeCompare(a.concertDate));

export const isOwner = (log: ConcertLog, userId: string): boolean => log.userId === userId;
