import type { CreateListeningLogInput, ListeningLog } from "../types";
import { Rating } from "./value-objects/rating";
import { ListeningLogId, UserId } from "./value-objects/ids";

export type ListeningLogRepository = {
  findById(id: ListeningLogId): Promise<ListeningLog | undefined>;
  findByUserId(userId: UserId): Promise<ListeningLog[]>;
  save(item: ListeningLog): Promise<void>;
  update(id: ListeningLogId, input: Partial<ListeningLog>): Promise<ListeningLog>;
  remove(id: ListeningLogId): Promise<void>;
};

type ListeningLogProps = {
  id: ListeningLogId;
  userId: UserId | null;
  listenedAt: string;
  composer: string;
  piece: string;
  rating: Rating;
  isFavorite: boolean;
  memo?: string;
  createdAt: string;
  updatedAt: string;
};

export class ListeningLogEntity {
  private constructor(private readonly props: ListeningLogProps) {}

  static create(input: CreateListeningLogInput): ListeningLogEntity {
    const now = new Date().toISOString();
    return new ListeningLogEntity({
      ...input,
      id: ListeningLogId.generate(),
      userId: input.userId === null ? null : UserId.from(input.userId),
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
      rating: Rating.of(data.rating),
    });
  }

  static sortByListenedAtDesc(entities: ListeningLogEntity[]): ListeningLogEntity[] {
    return [...entities].sort((a, b) => b.props.listenedAt.localeCompare(a.props.listenedAt));
  }

  isOwnedBy(userId: UserId): boolean {
    return this.props.userId !== null && this.props.userId.equals(userId);
  }

  toPlain(): ListeningLog {
    return {
      ...this.props,
      id: this.props.id.value,
      userId: this.props.userId === null ? null : this.props.userId.value,
      rating: this.props.rating.value,
    };
  }
}
