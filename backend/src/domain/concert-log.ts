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

/**
 * 鑑賞記録の訂正内容を表す型。フィールド単位の差分を 1 つのオブジェクトで表現する。
 * このアプリは鑑賞者の個人ノートであり、コンサートを「主催・運営」しているわけではないため、
 * フィールドごとの意図メソッド（rename / relocate / reschedule …）には実体が伴わない。
 * 操作はすべて「過去に観測した事実の記録を訂正・追記する」という単一のドメイン操作に帰着する。
 */
export type ConcertLogRevision = UpdateConcertLogInput;

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

  /**
   * 鑑賞記録を訂正する。フィールドごとの意図メソッドを生やす代わりに、
   * 「観測した事実の記録を後から書き直す」という単一の意図を 1 メソッドで表す。
   */
  revise(revision: ConcertLogRevision): ConcertLogEntity {
    const merged = buildUpdateProps(this.toPlain(), revision, []);
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
