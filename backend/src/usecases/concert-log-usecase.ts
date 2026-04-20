import { ConcertLogEntity } from "../domain/concert-log";
import type { ConcertLogRepository } from "../domain/concert-log";
import { DynamoDBConcertLogRepository } from "../repositories/concert-log-repository";
import type { ConcertLog, CreateConcertLogInput } from "../types";
import { loadOwnedEntityOrNotFound } from "./helpers";

const ENTITY_NAME = "Concert log";

export class ConcertLogUsecase {
  constructor(private readonly repo: ConcertLogRepository) {}

  private loadOwnedEntity(id: string, userId: string): Promise<ConcertLogEntity> {
    return loadOwnedEntityOrNotFound({
      findById: (id) => this.repo.findById(id),
      reconstruct: ConcertLogEntity.reconstruct,
      id,
      userId,
      entityName: ENTITY_NAME,
    });
  }

  async create(input: CreateConcertLogInput, userId: string): Promise<ConcertLog> {
    const entity = ConcertLogEntity.create(input, userId);
    const plain = entity.toPlain();
    await this.repo.save(plain);
    return plain;
  }

  async list(userId: string): Promise<ConcertLog[]> {
    const items = await this.repo.findByUserId(userId);
    const entities = items.map((item) => ConcertLogEntity.reconstruct(item));
    return ConcertLogEntity.sortByConcertDateDesc(entities).map((e) => e.toPlain());
  }

  async get(id: string, userId: string): Promise<ConcertLog> {
    const entity = await this.loadOwnedEntity(id, userId);
    return entity.toPlain();
  }

  async update(id: string, input: Partial<ConcertLog>, userId: string): Promise<ConcertLog> {
    await this.loadOwnedEntity(id, userId);
    return this.repo.update(id, input);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.loadOwnedEntity(id, userId);
    await this.repo.remove(id);
  }
}

export const createConcertLogUsecase = () =>
  new ConcertLogUsecase(new DynamoDBConcertLogRepository());
