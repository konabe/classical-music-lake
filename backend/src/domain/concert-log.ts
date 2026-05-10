import type { ConcertLog, CreateConcertLogInput, UpdateConcertLogInput } from "../types";
import { Entity, type EntityProps } from "./entity";
import { buildUpdateProps } from "./entity-helpers";
import { ConcertTitle } from "./value-objects/concert-title";
import { ConcertLogId, PieceId, UserId } from "./value-objects/ids";
import { Venue } from "./value-objects/venue";

export type ConcertLogRepository = {
  findById(id: ConcertLogId): Promise<ConcertLog | undefined>;
  findByUserId(userId: UserId): Promise<ConcertLog[]>;
  save(item: ConcertLog): Promise<void>;
  saveWithOptimisticLock(item: ConcertLog, prevUpdatedAt: string): Promise<void>;
  remove(id: ConcertLogId): Promise<void>;
};

type ConcertLogProps = EntityProps<ConcertLogId> & {
  userId: UserId;
  title: ConcertTitle;
  concertDate: string;
  venue: Venue;
  conductor?: string;
  orchestra?: string;
  soloist?: string;
  pieceIds?: PieceId[];
};

export class ConcertLogEntity extends Entity<ConcertLogId, ConcertLogProps> {
  private constructor(props: ConcertLogProps) {
    super(props);
  }

  static create(input: CreateConcertLogInput, userId: UserId): ConcertLogEntity {
    const now = new Date().toISOString();
    return new ConcertLogEntity({
      ...input,
      id: ConcertLogId.generate(),
      userId,
      title: ConcertTitle.of(input.title),
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
      title: ConcertTitle.of(data.title),
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

  mergeUpdate(input: UpdateConcertLogInput): ConcertLogEntity {
    const merged = buildUpdateProps(this.toPlain(), input, []);
    return ConcertLogEntity.reconstruct(merged);
  }

  toPlain(): ConcertLog {
    return {
      ...this.props,
      id: this.props.id.value,
      userId: this.props.userId.value,
      title: this.props.title.value,
      venue: this.props.venue.value,
      pieceIds:
        this.props.pieceIds === undefined ? undefined : this.props.pieceIds.map((id) => id.value),
    };
  }
}
