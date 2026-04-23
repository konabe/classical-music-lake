import type {
  Composer,
  CreateComposerInput,
  PieceEra,
  PieceRegion,
  UpdateComposerInput,
} from "../types";
import { buildUpdateProps } from "./entity-helpers";
import { ComposerName } from "./value-objects/composer-name";
import { ComposerId } from "./value-objects/ids";
import { Url } from "./value-objects/url";

const CLEARABLE_FIELDS = ["era", "region", "imageUrl"] as const;

export type ComposerRepository = {
  findById(id: ComposerId): Promise<Composer | undefined>;
  findPage(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<{ items: Composer[]; lastEvaluatedKey?: Record<string, unknown> }>;
  save(item: Composer): Promise<void>;
  saveWithOptimisticLock(item: Composer, prevUpdatedAt: string): Promise<void>;
  remove(id: ComposerId): Promise<void>;
};

type ComposerProps = {
  id: ComposerId;
  name: ComposerName;
  era?: PieceEra;
  region?: PieceRegion;
  imageUrl?: Url;
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
      name: ComposerName.of(input.name),
      imageUrl: input.imageUrl !== undefined ? Url.of(input.imageUrl) : undefined,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(data: Composer): ComposerEntity {
    return new ComposerEntity({
      ...data,
      id: ComposerId.from(data.id),
      name: ComposerName.of(data.name),
      imageUrl: data.imageUrl !== undefined ? Url.of(data.imageUrl) : undefined,
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
      name: this.props.name.value,
      imageUrl: this.props.imageUrl?.value,
    };
  }
}
