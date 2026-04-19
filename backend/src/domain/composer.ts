import { randomUUID } from "node:crypto";

import type { Composer, CreateComposerInput, UpdateComposerInput } from "../types";

const CLEARABLE_FIELDS = ["era", "region"] as const;

export type ComposerRepository = {
  findById(id: string): Promise<Composer | undefined>;
  findPage(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<{ items: Composer[]; lastEvaluatedKey?: Record<string, unknown> }>;
  save(item: Composer): Promise<void>;
  saveWithOptimisticLock(item: Composer, prevUpdatedAt: string): Promise<void>;
  remove(id: string): Promise<void>;
};

export class ComposerEntity {
  private constructor(private readonly props: Composer) {}

  static create(input: CreateComposerInput): ComposerEntity {
    const now = new Date().toISOString();
    return new ComposerEntity({ ...input, id: randomUUID(), createdAt: now, updatedAt: now });
  }

  static reconstruct(data: Composer): ComposerEntity {
    return new ComposerEntity(data);
  }

  get updatedAt(): string {
    return this.props.updatedAt;
  }

  mergeUpdate(input: UpdateComposerInput): ComposerEntity {
    const merged: Composer = {
      ...this.props,
      ...input,
      id: this.props.id,
      createdAt: this.props.createdAt,
      updatedAt: new Date().toISOString(),
    };
    const cleared = Object.fromEntries(
      Object.entries(merged).filter(([key, value]) => {
        return !(CLEARABLE_FIELDS as readonly string[]).includes(key) || value !== "";
      })
    ) as Composer;
    return new ComposerEntity(cleared);
  }

  toPlain(): Composer {
    return { ...this.props };
  }
}
