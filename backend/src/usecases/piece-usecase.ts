import createError from "http-errors";

import { PieceComponent, PieceMovementEntity, PieceWorkEntity } from "../domain/piece";
import type { PieceRepository } from "../domain/piece";
import { PieceId } from "../domain/value-objects/ids";
import { DynamoDBPieceRepository } from "../repositories/piece-repository";
import type {
  CreateMovementInput,
  CreatePieceInput,
  CreateWorkInput,
  Paginated,
  Piece,
  PieceMovement,
  PieceWork,
  UpdateMovementInput,
  UpdatePieceInput,
  UpdateWorkInput,
} from "../types";
import { findByIdOrNotFound, toPaginatedResult } from "./helpers";

// handlers 層は domain へ直接アクセスできないため、ID 値オブジェクトを usecase 層経由で公開する
export { PieceId };

const ENTITY_NAME = "Piece";

/**
 * Work（親楽曲）専用ユースケース。
 *
 * - リスト・取得は root（Work）のみを返す（`findRootPage` / `findRootById` 経由）。
 * - 削除は `removeWorkCascade` で配下 Movement までまとめて削除する。
 * - Movement の操作は {@link MovementUsecase} を使うこと。
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
    const entity = PieceWorkEntity.reconstruct(current);
    const updated = entity.mergeUpdate(input);
    const plain = updated.toPlain();
    await this.repo.saveWorkWithOptimisticLock(plain, current.updatedAt);
    return plain;
  }

  async delete(id: PieceId): Promise<void> {
    await this.repo.removeWorkCascade(id);
  }
}

/**
 * Movement（楽章）専用ユースケース。
 *
 * - 取得・更新・削除は kind を Movement に限定する（Work が紛れ込んだら 404 扱い）。
 * - 集合操作 `replaceMovements` は PR3 のエンドポイントから呼ばれる。
 */
export class MovementUsecase {
  constructor(private readonly repo: PieceRepository) {}

  async create(input: CreateMovementInput): Promise<PieceMovement> {
    const entity = PieceMovementEntity.create(input);
    const plain = entity.toPlain();
    await this.repo.saveMovement(plain);
    return plain;
  }

  async get(id: PieceId): Promise<PieceMovement> {
    const item = await this.repo.findById(id);
    if (item === undefined || item.kind !== "movement") {
      throw new createError.NotFound(`${ENTITY_NAME} not found`);
    }
    return item;
  }

  async update(id: PieceId, input: UpdateMovementInput): Promise<PieceMovement> {
    const current = await this.get(id);
    const entity = PieceMovementEntity.reconstruct(current);
    const updated = entity.mergeUpdate(input);
    const plain = updated.toPlain();
    await this.repo.saveMovementWithOptimisticLock(plain, current.updatedAt);
    return plain;
  }

  async delete(id: PieceId): Promise<void> {
    await this.repo.removeMovement(id);
  }

  async listChildren(parentId: PieceId): Promise<PieceMovement[]> {
    return this.repo.findChildren(parentId);
  }

  async replaceMovements(workId: PieceId, movements: PieceMovement[]): Promise<void> {
    await this.repo.replaceMovements(workId, movements);
  }
}

/**
 * `/pieces` ハンドラ向けの Composite ファサード。
 *
 * - 既存ハンドラ（`POST /pieces` 等）は kind に応じた dispatch を期待しており、
 *   このファサードを介して Work / Movement それぞれのユースケースに振り分ける。
 * - `getNode(id)` は kind を問わず単一ノードを取得する（PR3 で `/pieces/{id}/children` などから利用予定）。
 * - `list` / `get` の振る舞いは root（Work）限定で従来通り。
 */
export class PieceUsecase {
  private readonly work: WorkUsecase;
  private readonly movement: MovementUsecase;

  constructor(private readonly repo: PieceRepository) {
    this.work = new WorkUsecase(repo);
    this.movement = new MovementUsecase(repo);
  }

  async create(input: CreatePieceInput): Promise<Piece> {
    if (input.kind === "work") {
      return this.work.create(input);
    }
    return this.movement.create(input);
  }

  async list(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<Paginated<PieceWork>> {
    return this.work.list(options);
  }

  async get(id: PieceId): Promise<PieceWork> {
    return this.work.get(id);
  }

  /**
   * kind を問わず単一ノード（Work または Movement）を取得する。
   * 旧 `kind` 欠落レコードは Repository 側で `kind: "work"` に補完されて返る。
   */
  async getNode(id: PieceId): Promise<Piece> {
    return findByIdOrNotFound((id) => this.repo.findById(id), id, ENTITY_NAME);
  }

  async update(id: PieceId, input: UpdatePieceInput): Promise<Piece> {
    const current = await findByIdOrNotFound((id) => this.repo.findById(id), id, ENTITY_NAME);
    const entity = PieceComponent.reconstruct(current);
    const updated = PieceComponent.applyUpdate(entity, input);
    if (updated instanceof PieceWorkEntity) {
      const plain = updated.toPlain();
      await this.repo.saveWorkWithOptimisticLock(plain, current.updatedAt);
      return plain;
    }
    const plain = updated.toPlain();
    await this.repo.saveMovementWithOptimisticLock(plain, current.updatedAt);
    return plain;
  }

  async delete(id: PieceId): Promise<void> {
    await this.repo.removeWorkCascade(id);
  }
}

export const createWorkUsecase = (): WorkUsecase => new WorkUsecase(new DynamoDBPieceRepository());
export const createMovementUsecase = (): MovementUsecase =>
  new MovementUsecase(new DynamoDBPieceRepository());
export const createPieceUsecase = (): PieceUsecase =>
  new PieceUsecase(new DynamoDBPieceRepository());
