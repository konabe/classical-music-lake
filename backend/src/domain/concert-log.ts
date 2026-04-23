import type { ConcertLog, CreateConcertLogInput } from "../types";
import { ConcertLogId, PieceId, UserId } from "./value-objects/ids";
import { Venue } from "./value-objects/venue";

export type ConcertLogRepository = {
  findById(id: ConcertLogId): Promise<ConcertLog | undefined>;
  findByUserId(userId: UserId): Promise<ConcertLog[]>;
  save(item: ConcertLog): Promise<void>;
  update(id: ConcertLogId, input: Partial<ConcertLog>): Promise<ConcertLog>;
  remove(id: ConcertLogId): Promise<void>;
};

type ConcertLogProps = {
  id: ConcertLogId;
  userId: UserId;
  title: string;
  concertDate: string;
  venue: Venue;
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
      venue: Venue.of(input.venue),
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
      venue: Venue.of(data.venue),
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
      venue: this.props.venue.value,
      pieceIds:
        this.props.pieceIds === undefined ? undefined : this.props.pieceIds.map((id) => id.value),
    };
  }
}
