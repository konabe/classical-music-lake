import type { ConcertLog, CreateConcertLogInput } from "../types";
import { ConcertLogId } from "./value-objects/ids";
import type { UserId } from "./value-objects/ids";

export type ConcertLogRepository = {
  findById(id: string): Promise<ConcertLog | undefined>;
  findByUserId(userId: string): Promise<ConcertLog[]>;
  save(item: ConcertLog): Promise<void>;
  update(id: string, input: Partial<ConcertLog>): Promise<ConcertLog>;
  remove(id: string): Promise<void>;
};

export class ConcertLogEntity {
  private constructor(private readonly props: ConcertLog) {}

  static create(input: CreateConcertLogInput, userId: UserId): ConcertLogEntity {
    const now = new Date().toISOString();
    return new ConcertLogEntity({
      ...input,
      id: ConcertLogId.generate().value,
      userId: userId.value,
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

  isOwnedBy(userId: UserId): boolean {
    return this.props.userId === userId.value;
  }

  toPlain(): ConcertLog {
    return { ...this.props };
  }
}
