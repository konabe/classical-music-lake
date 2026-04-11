import { randomUUID } from "node:crypto";

import type { CreatePieceInput, Piece, UpdatePieceInput } from "../types";

const CLEARABLE_FIELDS = ["videoUrl", "genre", "era", "formation", "region"] as const;

export type PieceRepository = {
  findById(id: string): Promise<Piece | undefined>;
  findAll(): Promise<Piece[]>;
  save(item: Piece): Promise<void>;
  saveWithOptimisticLock(item: Piece, prevUpdatedAt: string): Promise<void>;
  remove(id: string): Promise<void>;
};

export class PieceEntity {
  private constructor(private readonly props: Piece) {}

  static create(input: CreatePieceInput): PieceEntity {
    const now = new Date().toISOString();
    return new PieceEntity({ ...input, id: randomUUID(), createdAt: now, updatedAt: now });
  }

  static reconstruct(data: Piece): PieceEntity {
    return new PieceEntity(data);
  }

  static sortByTitleJa(entities: PieceEntity[]): PieceEntity[] {
    return [...entities].sort((a, b) => a.props.title.localeCompare(b.props.title, "ja"));
  }

  get updatedAt(): string {
    return this.props.updatedAt;
  }

  mergeUpdate(input: UpdatePieceInput): PieceEntity {
    const merged: Piece = {
      ...this.props,
      ...input,
      id: this.props.id,
      createdAt: this.props.createdAt,
      updatedAt: new Date().toISOString(),
    };
    const cleared = Object.fromEntries(
      Object.entries(merged).filter(
        ([key, value]) => !(CLEARABLE_FIELDS as readonly string[]).includes(key) || value !== ""
      )
    ) as Piece;
    return new PieceEntity(cleared);
  }

  toPlain(): Piece {
    return { ...this.props };
  }
}
