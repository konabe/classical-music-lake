import type {
  CreatePieceInput,
  Piece,
  PieceEra,
  PieceFormation,
  PieceGenre,
  PieceRegion,
  UpdatePieceInput,
} from "../types";
import { buildUpdateProps } from "./entity-helpers";
import { ComposerId, PieceId } from "./value-objects/ids";

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

type PieceProps = {
  id: PieceId;
  title: string;
  composerId: ComposerId;
  videoUrl?: string;
  genre?: PieceGenre;
  era?: PieceEra;
  formation?: PieceFormation;
  region?: PieceRegion;
  createdAt: string;
  updatedAt: string;
};

export class PieceEntity {
  private constructor(private readonly props: PieceProps) {}

  static create(input: CreatePieceInput): PieceEntity {
    const now = new Date().toISOString();
    return new PieceEntity({
      ...input,
      id: PieceId.generate(),
      composerId: ComposerId.from(input.composerId),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(data: Piece): PieceEntity {
    return new PieceEntity({
      ...data,
      id: PieceId.from(data.id),
      composerId: ComposerId.from(data.composerId),
    });
  }

  get updatedAt(): string {
    return this.props.updatedAt;
  }

  mergeUpdate(input: UpdatePieceInput): PieceEntity {
    const merged = buildUpdateProps(this.toPlain(), input, CLEARABLE_FIELDS);
    return PieceEntity.reconstruct(merged);
  }

  toPlain(): Piece {
    return {
      ...this.props,
      id: this.props.id.value,
      composerId: this.props.composerId.value,
    };
  }
}
