import type {
  CreateListeningLogInput,
  ListeningLogRecord,
  UpdateListeningLogInput,
} from "../types";
import { Entity, type EntityProps } from "./entity";
import { buildUpdateProps } from "./entity-helpers";
import { Rating } from "./value-objects/rating";
import { ListeningLogId, PieceId, UserId } from "./value-objects/ids";

export type ListeningLogRepository = {
  findById(id: ListeningLogId): Promise<ListeningLogRecord | undefined>;
  findByUserId(userId: UserId): Promise<ListeningLogRecord[]>;
  /** 指定 pieceId 群のいずれかに紐付く ListeningLog が 1 件でも存在するかを返す（Piece 削除時の参照ガード用）。 */
  existsByPieceIds(pieceIds: PieceId[]): Promise<boolean>;
  save(item: ListeningLogRecord): Promise<void>;
  saveWithOptimisticLock(item: ListeningLogRecord, prevUpdatedAt: string): Promise<void>;
  remove(id: ListeningLogId): Promise<void>;
};

type ListeningLogProps = EntityProps<ListeningLogId> & {
  userId: UserId | null;
  listenedAt: string;
  pieceId: PieceId;
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
      pieceId: PieceId.from(input.pieceId),
      rating: Rating.of(input.rating),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(data: ListeningLogRecord): ListeningLogEntity {
    return new ListeningLogEntity({
      ...data,
      id: ListeningLogId.from(data.id),
      userId: data.userId === null ? null : UserId.from(data.userId),
      pieceId: PieceId.from(data.pieceId),
      rating: Rating.of(data.rating),
    });
  }

  static sortByListenedAtDesc(entities: ListeningLogEntity[]): ListeningLogEntity[] {
    return [...entities].sort((a, b) => b.props.listenedAt.localeCompare(a.props.listenedAt));
  }

  get pieceId(): PieceId {
    return this.props.pieceId;
  }

  isOwnedBy(userId: UserId): boolean {
    return this.props.userId !== null && this.props.userId.equals(userId);
  }

  mergeUpdate(input: UpdateListeningLogInput): ListeningLogEntity {
    const merged = buildUpdateProps(this.toPlain(), input, []);
    return ListeningLogEntity.reconstruct(merged);
  }

  toPlain(): ListeningLogRecord {
    return {
      ...this.props,
      id: this.props.id.value,
      userId: this.props.userId === null ? null : this.props.userId.value,
      pieceId: this.props.pieceId.value,
      rating: this.props.rating.value,
    };
  }
}
