import { PieceWorkEntity } from "../domain/piece";
import type { PieceRepository } from "../domain/piece";
import { PieceId } from "../domain/value-objects/ids";
import { DynamoDBPieceRepository } from "../repositories/piece-repository";
import type { CreateWorkInput, Paginated, PieceWork, UpdateWorkInput } from "../types";
import { findByIdOrNotFound, toPaginatedResult } from "./helpers";

// handlers 層は domain へ直接アクセスできないため、ID 値オブジェクトを usecase 層経由で公開する
export { PieceId };

const ENTITY_NAME = "Piece";

/**
 * 楽曲（Work）専用のユースケース。Composite モデルにおける親楽曲の CRUD を扱う。
 *
 * - `list` / `get` は `findRootPage` / `findRootById` で Work のみを返す（Movement は除外）。
 * - `delete` は `removeWorkCascade` で配下 Movement もまとめて削除する。
 * - Movement の操作は {@link MovementUsecase} を参照すること。
 */
export class WorkUsecase {
  constructor(private readonly repo: PieceRepository) {}

  async create(input: CreateWorkInput): Promise<PieceWork> {
    const entity = PieceWorkEntity.create(input);
    const plain = entity.toPlain();
    await this.repo.saveWork(plain);
    return plain;
  }

  async list(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<Paginated<PieceWork>> {
    return toPaginatedResult(await this.repo.findRootPage(options));
  }

  async get(id: PieceId): Promise<PieceWork> {
    return findByIdOrNotFound((id) => this.repo.findRootById(id), id, ENTITY_NAME);
  }

  async update(id: PieceId, input: UpdateWorkInput): Promise<PieceWork> {
    const current = await findByIdOrNotFound((id) => this.repo.findRootById(id), id, ENTITY_NAME);
    const updated = PieceWorkEntity.reconstruct(current).mergeUpdate(input);
    const plain = updated.toPlain();
    await this.repo.saveWorkWithOptimisticLock(plain, current.updatedAt);
    return plain;
  }

  async delete(id: PieceId): Promise<void> {
    await this.repo.removeWorkCascade(id);
  }
}

export const createWorkUsecase = () => new WorkUsecase(new DynamoDBPieceRepository());
