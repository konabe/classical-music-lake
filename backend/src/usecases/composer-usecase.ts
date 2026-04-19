import createError from "http-errors";

import { ComposerEntity } from "../domain/composer";
import type { ComposerRepository } from "../domain/composer";
import { DynamoDBComposerRepository } from "../repositories/composer-repository";
import type { Composer, CreateComposerInput, Paginated, UpdateComposerInput } from "../types";
import { encodeCursor } from "../utils/cursor";

export class ComposerUsecase {
  constructor(private readonly repo: ComposerRepository) {}

  async create(input: CreateComposerInput): Promise<Composer> {
    const entity = ComposerEntity.create(input);
    const plain = entity.toPlain();
    await this.repo.save(plain);
    return plain;
  }

  async list(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<Paginated<Composer>> {
    const { items, lastEvaluatedKey } = await this.repo.findPage(options);
    return {
      items,
      nextCursor: lastEvaluatedKey === undefined ? null : encodeCursor(lastEvaluatedKey),
    };
  }

  async get(id: string): Promise<Composer> {
    const item = await this.repo.findById(id);
    if (item === undefined) {
      throw new createError.NotFound("Composer not found");
    }
    return item;
  }

  async update(id: string, input: UpdateComposerInput): Promise<Composer> {
    const current = await this.repo.findById(id);
    if (current === undefined) {
      throw new createError.NotFound("Composer not found");
    }
    const entity = ComposerEntity.reconstruct(current);
    const updated = entity.mergeUpdate(input);
    const plain = updated.toPlain();
    await this.repo.saveWithOptimisticLock(plain, current.updatedAt);
    return plain;
  }

  async delete(id: string): Promise<void> {
    await this.repo.remove(id);
  }
}

export const createComposerUsecase = () => {
  return new ComposerUsecase(new DynamoDBComposerRepository());
};
