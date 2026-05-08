import type { CreateListeningLogInput, ListeningLog, UpdateListeningLogInput } from "../types";
import { Entity, type EntityProps } from "./entity";
import { buildUpdateProps } from "./entity-helpers";
import { Rating } from "./value-objects/rating";
import { ListeningLogId, PieceId, UserId } from "./value-objects/ids";

const CLEARABLE_FIELDS = ["pieceId"] as const;

export type ListeningLogRepository = {
  findById(id: ListeningLogId): Promise<ListeningLog | undefined>;
  findByUserId(userId: UserId): Promise<ListeningLog[]>;
  save(item: ListeningLog): Promise<void>;
  saveWithOptimisticLock(item: ListeningLog, prevUpdatedAt: string): Promise<void>;
  remove(id: ListeningLogId): Promise<void>;
};

type ListeningLogProps = EntityProps<ListeningLogId> & {
  userId: UserId | null;
  listenedAt: string;
  composer: string;
  piece: string;
  pieceId?: PieceId;
  rating: Rating;
  isFavorite: boolean;
  memo?: string;
};

export class ListeningLogEntity extends Entity<ListeningLogId, ListeningLogProps> {
  private constructor(props: ListeningLogProps) {
    super(props);
  }

  static create(input: CreateListeningLogInput): ListeningLogEntity {
    const now = new Date().toISOString();
    return new ListeningLogEntity({
      ...input,
      id: ListeningLogId.generate(),
      userId: input.userId === null ? null : UserId.from(input.userId),
      pieceId: input.pieceId === undefined ? undefined : PieceId.from(input.pieceId),
      rating: Rating.of(input.rating),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(data: ListeningLog): ListeningLogEntity {
    return new ListeningLogEntity({
      ...data,
      id: ListeningLogId.from(data.id),
      userId: data.userId === null ? null : UserId.from(data.userId),
      pieceId: data.pieceId === undefined ? undefined : PieceId.from(data.pieceId),
      rating: Rating.of(data.rating),
    });
  }

  static sortByListenedAtDesc(entities: ListeningLogEntity[]): ListeningLogEntity[] {
    return [...entities].sort((a, b) => b.props.listenedAt.localeCompare(a.props.listenedAt));
  }

  isOwnedBy(userId: UserId): boolean {
    return this.props.userId !== null && this.props.userId.equals(userId);
  }

  mergeUpdate(input: UpdateListeningLogInput): ListeningLogEntity {
    const merged = buildUpdateProps(this.toPlain(), input, CLEARABLE_FIELDS);
    return ListeningLogEntity.reconstruct(merged);
  }

  toPlain(): ListeningLog {
    return {
      ...this.props,
      id: this.props.id.value,
      userId: this.props.userId === null ? null : this.props.userId.value,
      pieceId: this.props.pieceId === undefined ? undefined : this.props.pieceId.value,
      rating: this.props.rating.value,
    };
  }
}
