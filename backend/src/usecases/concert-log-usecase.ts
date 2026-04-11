import createError from "http-errors";

import { ConcertLogEntity } from "../domain/concert-log";
import type { ConcertLogRepository } from "../domain/concert-log";
import { DynamoDBConcertLogRepository } from "../repositories/concert-log-repository";
import type { ConcertLog, CreateConcertLogInput } from "../types";

export class ConcertLogUsecase {
  constructor(private readonly repo: ConcertLogRepository) {}

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
    const item = await this.repo.findById(id);
    if (item === undefined) {
      throw new createError.NotFound("Concert log not found");
    }
    const entity = ConcertLogEntity.reconstruct(item);
    if (!entity.isOwnedBy(userId)) {
      throw new createError.NotFound("Concert log not found");
    }
    return entity.toPlain();
  }

  async update(id: string, input: Partial<ConcertLog>, userId: string): Promise<ConcertLog> {
    const item = await this.repo.findById(id);
    if (item === undefined) {
      throw new createError.NotFound("Concert log not found");
    }
    const entity = ConcertLogEntity.reconstruct(item);
    if (!entity.isOwnedBy(userId)) {
      throw new createError.NotFound("Concert log not found");
    }
    return this.repo.update(id, input);
  }

  async delete(id: string, userId: string): Promise<void> {
    const item = await this.repo.findById(id);
    if (item === undefined) {
      throw new createError.NotFound("Concert log not found");
    }
    const entity = ConcertLogEntity.reconstruct(item);
    if (!entity.isOwnedBy(userId)) {
      throw new createError.NotFound("Concert log not found");
    }
    await this.repo.remove(id);
  }
}

export const createConcertLogUsecase = () =>
  new ConcertLogUsecase(new DynamoDBConcertLogRepository());
