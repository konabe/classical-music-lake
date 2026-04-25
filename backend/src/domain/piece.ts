import type {
  CreatePieceInput,
  Piece,
  PieceEra,
  PieceFormation,
  PieceGenre,
  PieceRegion,
  UpdatePieceInput,
} from "../types";
import { Entity, type EntityProps } from "./entity";
import { buildUpdateProps } from "./entity-helpers";
import { ComposerId, PieceId } from "./value-objects/ids";
import { PieceTitle } from "./value-objects/piece-title";
import { Url } from "./value-objects/url";

const CLEARABLE_FIELDS = ["videoUrl", "genre", "era", "formation", "region"] as const;

export type PieceRepository = {
  findById(id: PieceId): Promise<Piece | undefined>;
  /**
   * @deprecated 新規コードでは {@link findPage} を使うこと。
   * 本関数は `usePiecesAll`（フロントの全件集約互換ヘルパー）の削除後に併せて廃止予定。
   */
  findAll(): Promise<Piece[]>;
  findPage(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<{ items: Piece[]; lastEvaluatedKey?: Record<string, unknown> }>;
  save(item: Piece): Promise<void>;
  saveWithOptimisticLock(item: Piece, prevUpdatedAt: string): Promise<void>;
  remove(id: PieceId): Promise<void>;
};

type PieceProps = EntityProps<PieceId> & {
  title: PieceTitle;
  composerId: ComposerId;
  videoUrl?: Url;
  genre?: PieceGenre;
  era?: PieceEra;
  formation?: PieceFormation;
  region?: PieceRegion;
};

export class PieceEntity extends Entity<PieceId, PieceProps> {
  private constructor(props: PieceProps) {
    super(props);
  }

  static create(input: CreatePieceInput): PieceEntity {
    const now = new Date().toISOString();
    return new PieceEntity({
      ...input,
      id: PieceId.generate(),
      title: PieceTitle.of(input.title),
      composerId: ComposerId.from(input.composerId),
      videoUrl: input.videoUrl !== undefined ? Url.of(input.videoUrl) : undefined,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(data: Piece): PieceEntity {
    return new PieceEntity({
      ...data,
      id: PieceId.from(data.id),
      title: PieceTitle.of(data.title),
      composerId: ComposerId.from(data.composerId),
      videoUrl: data.videoUrl !== undefined ? Url.of(data.videoUrl) : undefined,
    });
  }

  mergeUpdate(input: UpdatePieceInput): PieceEntity {
    const merged = buildUpdateProps(this.toPlain(), input, CLEARABLE_FIELDS);
    return PieceEntity.reconstruct(merged);
  }

  toPlain(): Piece {
    return {
      ...this.props,
      id: this.props.id.value,
      title: this.props.title.value,
      composerId: this.props.composerId.value,
      videoUrl: this.props.videoUrl?.value,
    };
  }
}
