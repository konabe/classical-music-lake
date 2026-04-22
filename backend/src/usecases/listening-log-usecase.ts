import { ListeningLogEntity } from "../domain/listening-log";
import type { ListeningLogRepository } from "../domain/listening-log";
import { ListeningLogId } from "../domain/value-objects/ids";
import type { UserId } from "../domain/value-objects/ids";
import { DynamoDBListeningLogRepository } from "../repositories/listening-log-repository";
import type { CreateListeningLogInput, ListeningLog } from "../types";
import { loadOwnedEntityOrNotFound } from "./helpers";

// handlers 層は domain へ直接アクセスできないため、ID 値オブジェクトを usecase 層経由で公開する
export { ListeningLogId };

const ENTITY_NAME = "Listening log";

export class ListeningLogUsecase {
  constructor(private readonly repo: ListeningLogRepository) {}

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
    const plain = entity.toPlain();
    await this.repo.save(plain);
    return plain;
  }

  async list(userId: UserId): Promise<ListeningLog[]> {
    const items = await this.repo.findByUserId(userId);
    const entities = items.map((item) => ListeningLogEntity.reconstruct(item));
    return ListeningLogEntity.sortByListenedAtDesc(entities).map((e) => e.toPlain());
  }

  async get(id: ListeningLogId, userId: UserId): Promise<ListeningLog> {
    const entity = await this.loadOwnedEntity(id, userId);
    return entity.toPlain();
  }

  async update(
    id: ListeningLogId,
    input: Partial<ListeningLog>,
    userId: UserId
  ): Promise<ListeningLog> {
    await this.loadOwnedEntity(id, userId);
    return this.repo.update(id, input);
  }

  async delete(id: ListeningLogId, userId: UserId): Promise<void> {
    await this.loadOwnedEntity(id, userId);
    await this.repo.remove(id);
  }
}

export const createListeningLogUsecase = () =>
  new ListeningLogUsecase(new DynamoDBListeningLogRepository());
