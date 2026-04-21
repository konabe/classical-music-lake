import type { CreatePieceInput, Piece, UpdatePieceInput } from "../types";
import { buildCreateProps, buildUpdateProps } from "./entity-helpers";

const CLEARABLE_FIELDS = ["videoUrl", "genre", "era", "formation", "region"] as const;

export type PieceRepository = {
  findById(id: string): Promise<Piece | undefined>;
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
  remove(id: string): Promise<void>;
};

export class PieceEntity {
  private constructor(private readonly props: Piece) {}

  static create(input: CreatePieceInput): PieceEntity {
    return new PieceEntity(buildCreateProps<CreatePieceInput, Piece>(input));
  }

  static reconstruct(data: Piece): PieceEntity {
    return new PieceEntity(data);
  }

  get updatedAt(): string {
    return this.props.updatedAt;
  }

  mergeUpdate(input: UpdatePieceInput): PieceEntity {
    return new PieceEntity(buildUpdateProps(this.props, input, CLEARABLE_FIELDS));
  }

  toPlain(): Piece {
    return { ...this.props };
  }
}
