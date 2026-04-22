import type {
  Composer,
  CreateComposerInput,
  PieceEra,
  PieceRegion,
  UpdateComposerInput,
} from "../types";
import { buildUpdateProps } from "./entity-helpers";
import { ComposerId } from "./value-objects/ids";

const CLEARABLE_FIELDS = ["era", "region", "imageUrl"] as const;

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

type ComposerProps = {
  id: ComposerId;
  name: string;
  era?: PieceEra;
  region?: PieceRegion;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export class ComposerEntity {
  private constructor(private readonly props: ComposerProps) {}

  static create(input: CreateComposerInput): ComposerEntity {
    const now = new Date().toISOString();
    return new ComposerEntity({
      ...input,
      id: ComposerId.generate(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(data: Composer): ComposerEntity {
    return new ComposerEntity({
      ...data,
      id: ComposerId.from(data.id),
    });
  }

  get updatedAt(): string {
    return this.props.updatedAt;
  }

  mergeUpdate(input: UpdateComposerInput): ComposerEntity {
    const merged = buildUpdateProps(this.toPlain(), input, CLEARABLE_FIELDS);
    return ComposerEntity.reconstruct(merged);
  }

  toPlain(): Composer {
    return {
      ...this.props,
      id: this.props.id.value,
    };
  }
}
