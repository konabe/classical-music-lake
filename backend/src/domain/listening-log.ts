import { randomUUID } from "node:crypto";

import type { CreateListeningLogInput, ListeningLog } from "../types";

export type ListeningLogRepository = {
  findById(id: string): Promise<ListeningLog | undefined>;
  findByUserId(userId: string): Promise<ListeningLog[]>;
  save(item: ListeningLog): Promise<void>;
  update(id: string, input: Partial<ListeningLog>): Promise<ListeningLog>;
  remove(id: string): Promise<void>;
};

export class ListeningLogEntity {
  private constructor(private readonly props: ListeningLog) {}

  static create(input: CreateListeningLogInput): ListeningLogEntity {
    const now = new Date().toISOString();
    return new ListeningLogEntity({ ...input, id: randomUUID(), createdAt: now, updatedAt: now });
  }

  static reconstruct(data: ListeningLog): ListeningLogEntity {
    return new ListeningLogEntity(data);
  }

  static sortByListenedAtDesc(entities: ListeningLogEntity[]): ListeningLogEntity[] {
    return [...entities].sort((a, b) => {
      return b.props.listenedAt.localeCompare(a.props.listenedAt);
    });
  }

  isOwnedBy(userId: string): boolean {
    return this.props.userId === userId;
  }

  toPlain(): ListeningLog {
    return { ...this.props };
  }
}
