import type {
  Composer,
  CreateComposerInput,
  PieceEra,
  PieceRegion,
  UpdateComposerInput,
} from "../types";
import { Entity, type EntityProps } from "./entity";
import { buildUpdateProps } from "./entity-helpers";
import { ComposerName } from "./value-objects/composer-name";
import { ComposerId } from "./value-objects/ids";
import { Url } from "./value-objects/url";
import { Year } from "./value-objects/year";

const CLEARABLE_FIELDS = ["era", "region", "imageUrl", "birthYear", "deathYear"] as const;

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

type ComposerProps = EntityProps<ComposerId> & {
  name: ComposerName;
  era?: PieceEra;
  region?: PieceRegion;
  imageUrl?: Url;
  birthYear?: Year;
  deathYear?: Year;
};

export class ComposerEntity extends Entity<ComposerId, ComposerProps> {
  private constructor(props: ComposerProps) {
    super(props);
  }

  static create(input: CreateComposerInput): ComposerEntity {
    const now = new Date().toISOString();
    return new ComposerEntity({
      ...input,
      id: ComposerId.generate(),
      name: ComposerName.of(input.name),
      imageUrl: input.imageUrl !== undefined ? Url.of(input.imageUrl) : undefined,
      birthYear: input.birthYear !== undefined ? Year.of(input.birthYear) : undefined,
      deathYear: input.deathYear !== undefined ? Year.of(input.deathYear) : undefined,
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
      birthYear: data.birthYear !== undefined ? Year.of(data.birthYear) : undefined,
      deathYear: data.deathYear !== undefined ? Year.of(data.deathYear) : undefined,
    });
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
      birthYear: this.props.birthYear?.value,
      deathYear: this.props.deathYear?.value,
    };
  }
}
