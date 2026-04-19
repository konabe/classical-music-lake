import createError from "http-errors";

import { PieceEntity } from "../domain/piece";
import type { PieceRepository } from "../domain/piece";
import { DynamoDBPieceRepository } from "../repositories/piece-repository";
import type { CreatePieceInput, Paginated, Piece, UpdatePieceInput } from "../types";
import { encodeCursor } from "../utils/cursor";

export class PieceUsecase {
  constructor(private readonly repo: PieceRepository) {}

  async create(input: CreatePieceInput): Promise<Piece> {
    const entity = PieceEntity.create(input);
    const plain = entity.toPlain();
    await this.repo.save(plain);
    return plain;
  }

  async list(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<Paginated<Piece>> {
    const { items, lastEvaluatedKey } = await this.repo.findPage(options);
    return {
      items,
      nextCursor: lastEvaluatedKey === undefined ? null : encodeCursor(lastEvaluatedKey),
    };
  }

  async get(id: string): Promise<Piece> {
    const item = await this.repo.findById(id);
    if (item === undefined) {
      throw new createError.NotFound("Piece not found");
    }
    return item;
  }

  async update(id: string, input: UpdatePieceInput): Promise<Piece> {
    const current = await this.repo.findById(id);
    if (current === undefined) {
      throw new createError.NotFound("Piece not found");
    }
    const entity = PieceEntity.reconstruct(current);
    const updated = entity.mergeUpdate(input);
    const plain = updated.toPlain();
    await this.repo.saveWithOptimisticLock(plain, current.updatedAt);
    return plain;
  }

  async delete(id: string): Promise<void> {
    await this.repo.remove(id);
  }
}

export const createPieceUsecase = () => {
  return new PieceUsecase(new DynamoDBPieceRepository());
};
