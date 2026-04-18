import createError from "http-errors";

import { ListeningLogEntity } from "../domain/listening-log";
import type { ListeningLogRepository } from "../domain/listening-log";
import { DynamoDBListeningLogRepository } from "../repositories/listening-log-repository";
import type { CreateListeningLogInput, ListeningLog } from "../types";

export class ListeningLogUsecase {
  constructor(private readonly repo: ListeningLogRepository) {}

  private async loadOwnedEntity(id: string, userId: string): Promise<ListeningLogEntity> {
    const item = await this.repo.findById(id);
    if (item === undefined) {
      throw new createError.NotFound("Listening log not found");
    }
    const entity = ListeningLogEntity.reconstruct(item);
    if (!entity.isOwnedBy(userId)) {
      throw new createError.NotFound("Listening log not found");
    }
    return entity;
  }

  async create(input: CreateListeningLogInput): Promise<ListeningLog> {
    const entity = ListeningLogEntity.create(input);
    const plain = entity.toPlain();
    await this.repo.save(plain);
    return plain;
  }

  async list(userId: string): Promise<ListeningLog[]> {
    const items = await this.repo.findByUserId(userId);
    const entities = items.map((item) => ListeningLogEntity.reconstruct(item));
    return ListeningLogEntity.sortByListenedAtDesc(entities).map((e) => e.toPlain());
  }

  async get(id: string, userId: string): Promise<ListeningLog> {
    const entity = await this.loadOwnedEntity(id, userId);
    return entity.toPlain();
  }

  async update(id: string, input: Partial<ListeningLog>, userId: string): Promise<ListeningLog> {
    await this.loadOwnedEntity(id, userId);
    return this.repo.update(id, input);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.loadOwnedEntity(id, userId);
    await this.repo.remove(id);
  }
}

export const createListeningLogUsecase = () =>
  new ListeningLogUsecase(new DynamoDBListeningLogRepository());
