import type { Composer, CreateComposerInput, UpdateComposerInput } from "../types";
import { buildCreateProps, buildUpdateProps } from "./entity-helpers";
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

export class ComposerEntity {
  private constructor(private readonly props: Composer) {}

  static create(input: CreateComposerInput): ComposerEntity {
    return new ComposerEntity(
      buildCreateProps<CreateComposerInput, Composer>(input, ComposerId.generate().value)
    );
  }

  static reconstruct(data: Composer): ComposerEntity {
    return new ComposerEntity(data);
  }

  get updatedAt(): string {
    return this.props.updatedAt;
  }

  mergeUpdate(input: UpdateComposerInput): ComposerEntity {
    return new ComposerEntity(buildUpdateProps(this.props, input, CLEARABLE_FIELDS));
  }

  toPlain(): Composer {
    return { ...this.props };
  }
}
