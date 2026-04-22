import { ComposerEntity } from "../domain/composer";
import type { ComposerRepository } from "../domain/composer";
import { ComposerId } from "../domain/value-objects/ids";
import { DynamoDBComposerRepository } from "../repositories/composer-repository";
import type { Composer, CreateComposerInput, Paginated, UpdateComposerInput } from "../types";
import { findByIdOrNotFound, toPaginatedResult } from "./helpers";

// handlers 層は domain へ直接アクセスできないため、ID 値オブジェクトを usecase 層経由で公開する
export { ComposerId };

const ENTITY_NAME = "Composer";

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
    return toPaginatedResult(await this.repo.findPage(options));
  }

  async get(id: ComposerId): Promise<Composer> {
    return findByIdOrNotFound((id) => this.repo.findById(id), id, ENTITY_NAME);
  }

  async update(id: ComposerId, input: UpdateComposerInput): Promise<Composer> {
    const current = await findByIdOrNotFound((id) => this.repo.findById(id), id, ENTITY_NAME);
    const entity = ComposerEntity.reconstruct(current);
    const updated = entity.mergeUpdate(input);
    const plain = updated.toPlain();
    await this.repo.saveWithOptimisticLock(plain, current.updatedAt);
    return plain;
  }

  async delete(id: ComposerId): Promise<void> {
    await this.repo.remove(id);
  }
}

export const createComposerUsecase = () => new ComposerUsecase(new DynamoDBComposerRepository());
