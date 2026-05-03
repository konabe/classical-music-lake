import {
  applyPieceUpdate,
  PieceMovementEntity,
  PieceWorkEntity,
  createPieceComponent,
  reconstructPieceComponent,
} from "../domain/piece";
import type { PieceRepository } from "../domain/piece";
import { PieceId } from "../domain/value-objects/ids";
import { DynamoDBPieceRepository } from "../repositories/piece-repository";
import type { CreatePieceInput, Paginated, Piece, PieceWork, UpdatePieceInput } from "../types";
import { findByIdOrNotFound, toPaginatedResult } from "./helpers";

// handlers 層は domain へ直接アクセスできないため、ID 値オブジェクトを usecase 層経由で公開する
export { PieceId };

const ENTITY_NAME = "Piece";

/**
 * 楽曲マスタのユースケース。
 *
 * - PR1 時点で公開している API は引き続き Work（親楽曲）のみを対象とする
 *   （`list` は `findRootPage` で Work だけを列挙、`get`/`update`/`delete` も Work 限定）。
 * - 内部ではドメインの Composite モデル（Work / Movement）と新リポジトリ I/F を利用する。
 * - Movement 系のエンドポイントは PR2 以降で追加する。
 */
export class PieceUsecase {
  constructor(private readonly repo: PieceRepository) {}

  async create(input: CreatePieceInput): Promise<Piece> {
    const entity = createPieceComponent(input);
    const plain = entity.toPlain();
    if (entity instanceof PieceWorkEntity) {
      await this.repo.saveWork(plain as PieceWork);
    } else if (entity instanceof PieceMovementEntity) {
      await this.repo.saveMovement(entity.toPlain());
    }
    return plain;
  }

  async list(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<Paginated<Piece>> {
    return toPaginatedResult(await this.repo.findRootPage(options));
  }

  async get(id: PieceId): Promise<Piece> {
    return findByIdOrNotFound((id) => this.repo.findRootById(id), id, ENTITY_NAME);
  }

  async update(id: PieceId, input: UpdatePieceInput): Promise<Piece> {
    const current = await findByIdOrNotFound((id) => this.repo.findById(id), id, ENTITY_NAME);
    const entity = reconstructPieceComponent(current);
    const updated = applyPieceUpdate(entity, input);
    const plain = updated.toPlain();
    if (updated instanceof PieceWorkEntity) {
      await this.repo.saveWorkWithOptimisticLock(plain as PieceWork, current.updatedAt);
    } else {
      await this.repo.saveMovementWithOptimisticLock(updated.toPlain(), current.updatedAt);
    }
    return plain;
  }

  async delete(id: PieceId): Promise<void> {
    await this.repo.removeWorkCascade(id);
  }
}

export const createPieceUsecase = () => new PieceUsecase(new DynamoDBPieceRepository());
