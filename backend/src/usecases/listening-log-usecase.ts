import createError from "http-errors";

import type { ComposerRepository } from "../domain/composer";
import { ListeningLogDetail } from "../domain/listening-log-detail";
import { ListeningLogEntity } from "../domain/listening-log";
import type { ListeningLogRepository } from "../domain/listening-log";
import { PieceComponent, PieceWorkEntity } from "../domain/piece";
import type { PieceRepository } from "../domain/piece";
import { ComposerId, ListeningLogId, PieceId } from "../domain/value-objects/ids";
import type { UserId } from "../domain/value-objects/ids";
import { DynamoDBComposerRepository } from "../repositories/composer-repository";
import { DynamoDBListeningLogRepository } from "../repositories/listening-log-repository";
import { DynamoDBPieceRepository } from "../repositories/piece-repository";
import type {
  Composer,
  CreateListeningLogInput,
  ListeningLog,
  Piece,
  PieceWork,
  UpdateListeningLogInput,
} from "../types";
import { loadOwnedEntityOrNotFound } from "./helpers";

// handlers 層は domain へ直接アクセスできないため、ID 値オブジェクトを usecase 層経由で公開する
export { ListeningLogId };

const ENTITY_NAME = "Listening log";

/**
 * ListeningLog のユースケース。
 *
 * 永続化されている素の Record（pieceId のみ）と、API レスポンス DTO（pieceTitle・composerId・
 * composerName を派生値として含むフラット形）の橋渡しを担う。表示用の派生値は
 * {@link ListeningLogDetail} で組み立て、必要な Piece / Composer は本ユースケース内で
 * BatchGet 風にまとめて取得することで N+1 を回避する。
 */
export class ListeningLogUsecase {
  constructor(
    private readonly repo: ListeningLogRepository,
    private readonly pieceRepo: PieceRepository,
    private readonly composerRepo: ComposerRepository,
  ) {}

  private loadOwnedEntity(id: ListeningLogId, userId: UserId): Promise<ListeningLogEntity> {
    return loadOwnedEntityOrNotFound({
      findById: (id) => this.repo.findById(id),
      reconstruct: ListeningLogEntity.reconstruct,
      id,
      userId,
      entityName: ENTITY_NAME,
    });
  }

  async create(input: CreateListeningLogInput): Promise<ListeningLog> {
    const entity = ListeningLogEntity.create(input);
    await this.repo.save(entity.toPlain());
    return this.toDetailDto(entity);
  }

  async list(userId: UserId): Promise<ListeningLog[]> {
    const items = await this.repo.findByUserId(userId);
    const entities = ListeningLogEntity.sortByListenedAtDesc(
      items.map((item) => ListeningLogEntity.reconstruct(item)),
    );
    return this.toDetailDtoList(entities);
  }

  async get(id: ListeningLogId, userId: UserId): Promise<ListeningLog> {
    const entity = await this.loadOwnedEntity(id, userId);
    return this.toDetailDto(entity);
  }

  async update(
    id: ListeningLogId,
    input: UpdateListeningLogInput,
    userId: UserId,
  ): Promise<ListeningLog> {
    const current = await this.loadOwnedEntity(id, userId);
    const updated = ListeningLogEntity.applyRevisions(current, input);
    await this.repo.saveWithOptimisticLock(updated.toPlain(), current.updatedAt);
    return this.toDetailDto(updated);
  }

  async delete(id: ListeningLogId, userId: UserId): Promise<void> {
    await this.loadOwnedEntity(id, userId);
    await this.repo.remove(id);
  }

  /** 1 件分の Detail を組み立てる（参照する Piece / Composer も都度取得）。 */
  private async toDetailDto(entity: ListeningLogEntity): Promise<ListeningLog> {
    const piece = await this.findPieceOrThrow(entity.pieceId);
    const parentWork = await this.resolveParentWork(piece);
    const composerId = this.resolveComposerId(piece, parentWork);
    const composer = await this.findComposerOrThrow(composerId);
    const pieceEntity = PieceComponent.reconstruct(piece);
    const parentWorkEntity = parentWork === null ? null : PieceWorkEntity.reconstruct(parentWork);
    return ListeningLogDetail.from(entity, pieceEntity, parentWorkEntity, composer).toPlain();
  }

  /**
   * 一覧用の Detail 組み立て。重複する pieceId / composerId をリポジトリの `findByIds` に
   * 委ねることで N+1 アクセスを避ける（重複排除は呼び出し側、まとめての並列 fetch ／ 将来的な
   * BatchGetItem 化はリポジトリ側の責務とする）。
   */
  private async toDetailDtoList(entities: ListeningLogEntity[]): Promise<ListeningLog[]> {
    if (entities.length === 0) {
      return [];
    }
    const uniquePieceIds = uniqueByValue(entities.map((e) => e.pieceId));
    const pieces = indexByIdValue(await this.pieceRepo.findByIds(uniquePieceIds));

    const parentWorkIds = collectParentWorkIds(pieces.values());
    const parentWorks = indexByIdValue(
      (await this.pieceRepo.findByIds(parentWorkIds)).filter(
        (p): p is PieceWork => p.kind === "work",
      ),
    );

    const composerIds = collectComposerIds(pieces.values(), parentWorks);
    const composers = indexByIdValue(await this.composerRepo.findByIds(composerIds));

    return entities.map((entity) => {
      const piece = pieces.get(entity.pieceId.value);
      if (piece === undefined) {
        throw new createError.NotFound("Piece referenced by listening log not found");
      }
      const parentWork =
        piece.kind === "movement" ? (parentWorks.get(piece.parentId) ?? null) : null;
      if (piece.kind === "movement" && parentWork === null) {
        throw new createError.NotFound("Parent piece referenced by movement not found");
      }
      const composerId = piece.kind === "work" ? piece.composerId : parentWork!.composerId;
      const composer = composers.get(composerId);
      if (composer === undefined) {
        throw new createError.NotFound("Composer referenced by piece not found");
      }
      const pieceEntity = PieceComponent.reconstruct(piece);
      const parentWorkEntity = parentWork === null ? null : PieceWorkEntity.reconstruct(parentWork);
      return ListeningLogDetail.from(entity, pieceEntity, parentWorkEntity, composer).toPlain();
    });
  }

  private async findPieceOrThrow(id: PieceId): Promise<Piece> {
    const piece = await this.pieceRepo.findById(id);
    if (piece === undefined) {
      throw new createError.NotFound("Piece referenced by listening log not found");
    }
    return piece;
  }

  private async resolveParentWork(piece: Piece): Promise<PieceWork | null> {
    if (piece.kind === "work") {
      return null;
    }
    const parent = await this.pieceRepo.findRootById(PieceId.from(piece.parentId));
    if (parent === undefined) {
      throw new createError.NotFound("Parent piece referenced by movement not found");
    }
    return parent;
  }

  private resolveComposerId(piece: Piece, parentWork: PieceWork | null): ComposerId {
    if (piece.kind === "work") {
      return ComposerId.from(piece.composerId);
    }
    return ComposerId.from(parentWork!.composerId);
  }

  private async findComposerOrThrow(id: ComposerId): Promise<Composer> {
    const composer = await this.composerRepo.findById(id);
    if (composer === undefined) {
      throw new createError.NotFound("Composer referenced by piece not found");
    }
    return composer;
  }
}

const indexByIdValue = <T extends { id: string }>(items: T[]): Map<string, T> => {
  const map = new Map<string, T>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return map;
};

const uniqueByValue = <T extends { value: string }>(ids: T[]): T[] => {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const id of ids) {
    if (!seen.has(id.value)) {
      seen.add(id.value);
      result.push(id);
    }
  }
  return result;
};

const collectParentWorkIds = (pieces: Iterable<Piece>): PieceId[] => {
  const ids: PieceId[] = [];
  const seen = new Set<string>();
  for (const piece of pieces) {
    if (piece.kind !== "movement") {
      continue;
    }
    if (seen.has(piece.parentId)) {
      continue;
    }
    seen.add(piece.parentId);
    ids.push(PieceId.from(piece.parentId));
  }
  return ids;
};

const collectComposerIds = (
  pieces: Iterable<Piece>,
  parentWorks: Map<string, PieceWork>,
): ComposerId[] => {
  const ids: ComposerId[] = [];
  const seen = new Set<string>();
  for (const piece of pieces) {
    const composerIdValue =
      piece.kind === "work" ? piece.composerId : parentWorks.get(piece.parentId)?.composerId;
    if (composerIdValue === undefined || seen.has(composerIdValue)) {
      continue;
    }
    seen.add(composerIdValue);
    ids.push(ComposerId.from(composerIdValue));
  }
  return ids;
};

export const createListeningLogUsecase = () =>
  new ListeningLogUsecase(
    new DynamoDBListeningLogRepository(),
    new DynamoDBPieceRepository(),
    new DynamoDBComposerRepository(),
  );
