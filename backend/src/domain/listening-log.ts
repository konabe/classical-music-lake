import type {
  CreateListeningLogInput,
  ListeningLogRecord,
  UpdateListeningLogInput,
} from "../types";
import { Entity, type EntityProps } from "./entity";
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

  /** お気に入りに加える。 */
  markAsFavorite(): ListeningLogEntity {
    return this.touched({ isFavorite: true });
  }

  /** お気に入りから外す。 */
  unmarkAsFavorite(): ListeningLogEntity {
    return this.touched({ isFavorite: false });
  }

  /** 評価を付け直す。 */
  rerate(rating: number): ListeningLogEntity {
    return this.touched({ rating });
  }

  /** メモを書き直す。空文字も許容する（API 仕様上の partial update 互換）。 */
  rewriteMemo(memo: string): ListeningLogEntity {
    return this.touched({ memo });
  }

  /** 視聴日時を訂正する。 */
  correctListenedAt(listenedAt: string): ListeningLogEntity {
    return this.touched({ listenedAt });
  }

  /** 別の楽曲に紐付け直す（事実訂正）。 */
  relinkPiece(pieceId: string): ListeningLogEntity {
    return this.touched({ pieceId });
  }

  /**
   * Update*Input の partial 仕様を意図メソッドへ dispatch する。input にキーが
   * 含まれているフィールドのみ適用する（partial update なので順序は可換）。
   * static にしてあるのは `let next = this` の alias を避けるため。
   */
  static applyRevisions(
    entity: ListeningLogEntity,
    input: UpdateListeningLogInput,
  ): ListeningLogEntity {
    let next = entity;
    if (input.isFavorite !== undefined) {
      next = input.isFavorite ? next.markAsFavorite() : next.unmarkAsFavorite();
    }
    if (input.rating !== undefined) {
      next = next.rerate(input.rating);
    }
    if (input.memo !== undefined) {
      next = next.rewriteMemo(input.memo);
    }
    if (input.listenedAt !== undefined) {
      next = next.correctListenedAt(input.listenedAt);
    }
    if (input.pieceId !== undefined) {
      next = next.relinkPiece(input.pieceId);
    }
    return next;
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

  private touched(diff: Partial<ListeningLogRecord>): ListeningLogEntity {
    return ListeningLogEntity.reconstruct({
      ...this.toPlain(),
      ...diff,
      updatedAt: new Date().toISOString(),
    });
  }
}
