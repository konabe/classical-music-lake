import { PieceEntity } from "../domain/piece";
import type { PieceRepository } from "../domain/piece";
import { PieceId } from "../domain/value-objects/ids";
import { DynamoDBPieceRepository } from "../repositories/piece-repository";
import type { CreatePieceInput, Paginated, Piece, UpdatePieceInput } from "../types";
import { findByIdOrNotFound, toPaginatedResult } from "./helpers";

// handlers 層は domain へ直接アクセスできないため、ID 値オブジェクトを usecase 層経由で公開する
export { PieceId };

const ENTITY_NAME = "Piece";

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
    return toPaginatedResult(await this.repo.findPage(options));
  }

  async get(id: PieceId): Promise<Piece> {
    return findByIdOrNotFound((id) => this.repo.findById(id), id, ENTITY_NAME);
  }

  async update(id: PieceId, input: UpdatePieceInput): Promise<Piece> {
    const current = await findByIdOrNotFound((id) => this.repo.findById(id), id, ENTITY_NAME);
    const entity = PieceEntity.reconstruct(current);
    const updated = entity.mergeUpdate(input);
    const plain = updated.toPlain();
    await this.repo.saveWithOptimisticLock(plain, current.updatedAt);
    return plain;
  }

  async delete(id: PieceId): Promise<void> {
    await this.repo.remove(id);
  }
}

export const createPieceUsecase = () => new PieceUsecase(new DynamoDBPieceRepository());
