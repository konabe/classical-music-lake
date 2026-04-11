import { randomUUID } from "node:crypto";

import type { ConcertLog, CreateConcertLogInput } from "../types";

export type ConcertLogRepository = {
  findById(id: string): Promise<ConcertLog | undefined>;
  findByUserId(userId: string): Promise<ConcertLog[]>;
  save(item: ConcertLog): Promise<void>;
  update(id: string, input: Partial<ConcertLog>): Promise<ConcertLog>;
  remove(id: string): Promise<void>;
};

export class ConcertLogEntity {
  private constructor(private readonly props: ConcertLog) {}

  static create(input: CreateConcertLogInput, userId: string): ConcertLogEntity {
    const now = new Date().toISOString();
    return new ConcertLogEntity({
      ...input,
      id: randomUUID(),
      userId,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(data: ConcertLog): ConcertLogEntity {
    return new ConcertLogEntity(data);
  }

  static sortByConcertDateDesc(entities: ConcertLogEntity[]): ConcertLogEntity[] {
    return [...entities].sort((a, b) => b.props.concertDate.localeCompare(a.props.concertDate));
  }

  isOwnedBy(userId: string): boolean {
    return this.props.userId === userId;
  }

  toPlain(): ConcertLog {
    return { ...this.props };
  }
}
