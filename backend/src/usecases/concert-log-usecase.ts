import { ConcertLogEntity } from "../domain/concert-log";
import type { ConcertLogRepository } from "../domain/concert-log";
import { ConcertLogId } from "../domain/value-objects/ids";
import type { UserId } from "../domain/value-objects/ids";
import { DynamoDBConcertLogRepository } from "../repositories/concert-log-repository";
import type { ConcertLog, CreateConcertLogInput } from "../types";
import { loadOwnedEntityOrNotFound } from "./helpers";

// handlers 層は domain へ直接アクセスできないため、ID 値オブジェクトを usecase 層経由で公開する
export { ConcertLogId };

const ENTITY_NAME = "Concert log";

export class ConcertLogUsecase {
  constructor(private readonly repo: ConcertLogRepository) {}

  private loadOwnedEntity(id: ConcertLogId, userId: UserId): Promise<ConcertLogEntity> {
    return loadOwnedEntityOrNotFound({
      findById: (id) => this.repo.findById(id),
      reconstruct: ConcertLogEntity.reconstruct,
      id,
      userId,
      entityName: ENTITY_NAME,
    });
  }

  async create(input: CreateConcertLogInput, userId: UserId): Promise<ConcertLog> {
    const entity = ConcertLogEntity.create(input, userId);
    const plain = entity.toPlain();
    await this.repo.save(plain);
    return plain;
  }

  async list(userId: UserId): Promise<ConcertLog[]> {
    const items = await this.repo.findByUserId(userId);
    const entities = items.map((item) => ConcertLogEntity.reconstruct(item));
    return ConcertLogEntity.sortByConcertDateDesc(entities).map((e) => e.toPlain());
  }

  async get(id: ConcertLogId, userId: UserId): Promise<ConcertLog> {
    const entity = await this.loadOwnedEntity(id, userId);
    return entity.toPlain();
  }

  async update(id: ConcertLogId, input: Partial<ConcertLog>, userId: UserId): Promise<ConcertLog> {
    await this.loadOwnedEntity(id, userId);
    return this.repo.update(id, input);
  }

  async delete(id: ConcertLogId, userId: UserId): Promise<void> {
    await this.loadOwnedEntity(id, userId);
    await this.repo.remove(id);
  }
}

export const createConcertLogUsecase = () =>
  new ConcertLogUsecase(new DynamoDBConcertLogRepository());
