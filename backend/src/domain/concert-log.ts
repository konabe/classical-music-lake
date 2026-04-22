import type { ConcertLog, CreateConcertLogInput } from "../types";
import { ConcertLogId, PieceId, UserId } from "./value-objects/ids";

export type ConcertLogRepository = {
  findById(id: string): Promise<ConcertLog | undefined>;
  findByUserId(userId: string): Promise<ConcertLog[]>;
  save(item: ConcertLog): Promise<void>;
  update(id: string, input: Partial<ConcertLog>): Promise<ConcertLog>;
  remove(id: string): Promise<void>;
};

type ConcertLogProps = {
  id: ConcertLogId;
  userId: UserId;
  title: string;
  concertDate: string;
  venue: string;
  conductor?: string;
  orchestra?: string;
  soloist?: string;
  pieceIds?: PieceId[];
  createdAt: string;
  updatedAt: string;
};

export class ConcertLogEntity {
  private constructor(private readonly props: ConcertLogProps) {}

  static create(input: CreateConcertLogInput, userId: UserId): ConcertLogEntity {
    const now = new Date().toISOString();
    return new ConcertLogEntity({
      ...input,
      id: ConcertLogId.generate(),
      userId,
      pieceIds: input.pieceIds === undefined ? undefined : input.pieceIds.map(PieceId.from),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(data: ConcertLog): ConcertLogEntity {
    return new ConcertLogEntity({
      ...data,
      id: ConcertLogId.from(data.id),
      userId: UserId.from(data.userId),
      pieceIds: data.pieceIds === undefined ? undefined : data.pieceIds.map(PieceId.from),
    });
  }

  static sortByConcertDateDesc(entities: ConcertLogEntity[]): ConcertLogEntity[] {
    return [...entities].sort((a, b) => b.props.concertDate.localeCompare(a.props.concertDate));
  }

  isOwnedBy(userId: UserId): boolean {
    return this.props.userId.equals(userId);
  }

  toPlain(): ConcertLog {
    return {
      ...this.props,
      id: this.props.id.value,
      userId: this.props.userId.value,
      pieceIds:
        this.props.pieceIds === undefined ? undefined : this.props.pieceIds.map((id) => id.value),
    };
  }
}
