import createError from "http-errors";

import type { ListeningLogRepository } from "../domain/listening-log";
import { PieceComponent, PieceMovementEntity, PieceWorkEntity } from "../domain/piece";
import type { PieceRepository } from "../domain/piece";
import { ComposerId, PieceId } from "../domain/value-objects/ids";
import { DynamoDBListeningLogRepository } from "../repositories/listening-log-repository";
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
 * Movement 集合一括差し替えの入力型。
 * - `id` は省略可能。指定されない場合は新規 UUID を採番する（追加扱い）。
 * - `parentId` はパスパラメータの workId から付与するため受け取らない。
 */
export type ReplaceMovementInput = {
  id?: string;
  index: number;
  title: string;
  videoUrls?: string[];
};

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
    if (item?.kind !== "movement") {
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

  /**
   * Work 配下の Movement 集合を一括置換する。Work の `updatedAt` も同時に進める（楽観的ロック付き）。
   *
   * - Work が存在しなければ 404 を投げる。
   * - 既存 Movement は内部で全件削除し、入力された `movements` のみ残る。
   * - `id` を持つ入力は既存 Movement の更新（`createdAt` を引き継ぐ）、無ければ新規採番。
   * - Work の楽観的ロックが衝突した場合は repository が 409 Conflict を投げる。
   */
  async replaceAll(workId: PieceId, movements: ReplaceMovementInput[]): Promise<PieceMovement[]> {
    const currentWork = await findByIdOrNotFound(
      (id) => this.repo.findRootById(id),
      workId,
      ENTITY_NAME,
    );
    const existingChildren = await this.repo.findChildren(workId);
    const existingById = new Map(existingChildren.map((m) => [m.id, m]));
    const now = new Date().toISOString();
    const newMovements: PieceMovement[] = movements.map((m) => {
      // id 指定 + 既存に存在 → 更新（createdAt を保持）。それ以外は新規採番。
      const matched = m.id === undefined ? undefined : existingById.get(m.id);
      const id = matched?.id ?? PieceId.generate().value;
      const createdAt = matched?.createdAt ?? now;
      return {
        kind: "movement" as const,
        id,
        parentId: workId.value,
        index: m.index,
        title: m.title,
        videoUrls: m.videoUrls,
        createdAt,
        updatedAt: now,
      };
    });
    // Work の updatedAt を進める（同一トランザクション内で楽観的ロック）
    const updatedWork: PieceWork = { ...currentWork, updatedAt: now };
    await this.repo.replaceMovements(workId, newMovements, {
      work: updatedWork,
      prevUpdatedAt: currentWork.updatedAt,
    });
    return newMovements;
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

  constructor(
    private readonly repo: PieceRepository,
    private readonly listeningLogRepo: ListeningLogRepository,
  ) {
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

  /**
   * 任意ノード（Work / Movement）から `composerId` を解決する。
   * - Work: 自身の `composerId` を返す。
   * - Movement: 親 Work を引き、親の `composerId` を返す。親が存在しなければ 404。
   *
   * Movement の API レスポンスには `composerId` を載せないが、内部処理（鑑賞記録の作曲家解決など）で
   * 親 Work からの継承を必要とするユースケースのために提供する。
   */
  async resolveComposerId(node: Piece): Promise<ComposerId> {
    if (node.kind === "work") {
      return ComposerId.from(node.composerId);
    }
    const parent = await findByIdOrNotFound(
      (id) => this.repo.findRootById(id),
      PieceId.from(node.parentId),
      ENTITY_NAME,
    );
    return ComposerId.from(parent.composerId);
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

  /**
   * kind を判別して削除する。
   * - Work: 配下 Movement までまとめて cascade 削除
   * - Movement: 単独削除（親 Work には影響しない）
   * - 存在しない id は冪等に扱い、何もせず終了する（DELETE 系の慣例どおり）
   *
   * 削除前に対象 Piece（Work の場合は配下 Movement を含む）を参照する ListeningLog が
   * 存在しないかチェックし、存在する場合は 409 Conflict を投げる（dangling reference 防止）。
   */
  async delete(id: PieceId): Promise<void> {
    const item = await this.repo.findById(id);
    if (item === undefined) {
      return;
    }
    const targetPieceIds: PieceId[] =
      item.kind === "work"
        ? [id, ...(await this.repo.findChildren(id)).map((m) => PieceId.from(m.id))]
        : [id];
    if (await this.listeningLogRepo.existsByPieceIds(targetPieceIds)) {
      throw new createError.Conflict("Cannot delete piece referenced by existing listening logs");
    }
    if (item.kind === "work") {
      await this.repo.removeWorkCascade(id);
      return;
    }
    await this.repo.removeMovement(id);
  }
}

export const createWorkUsecase = (): WorkUsecase => new WorkUsecase(new DynamoDBPieceRepository());
export const createMovementUsecase = (): MovementUsecase =>
  new MovementUsecase(new DynamoDBPieceRepository());
export const createPieceUsecase = (): PieceUsecase =>
  new PieceUsecase(new DynamoDBPieceRepository(), new DynamoDBListeningLogRepository());
