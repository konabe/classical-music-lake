import type { CreateListeningLogInput, ListeningLog } from "../types";
import { ListeningLogId } from "./value-objects/ids";
import type { UserId } from "./value-objects/ids";

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
    return new ListeningLogEntity({
      ...input,
      id: ListeningLogId.generate().value,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(data: ListeningLog): ListeningLogEntity {
    return new ListeningLogEntity(data);
  }

  static sortByListenedAtDesc(entities: ListeningLogEntity[]): ListeningLogEntity[] {
    return [...entities].sort((a, b) => b.props.listenedAt.localeCompare(a.props.listenedAt));
  }

  isOwnedBy(userId: UserId): boolean {
    return this.props.userId !== null && this.props.userId === userId.value;
  }

  toPlain(): ListeningLog {
    return { ...this.props };
  }
}
