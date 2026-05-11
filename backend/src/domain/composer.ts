import type {
  Composer,
  CreateComposerInput,
  PieceEra,
  PieceRegion,
  UpdateComposerInput,
} from "../types";
import { Entity, type EntityProps } from "./entity";
import { ComposerName } from "./value-objects/composer-name";
import { ComposerId } from "./value-objects/ids";
import { Url } from "./value-objects/url";
import { Year } from "./value-objects/year";

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

type OptionalComposerPropKey = "era" | "region" | "imageUrl" | "birthYear" | "deathYear";

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
      imageUrl: input.imageUrl === undefined ? undefined : Url.of(input.imageUrl),
      birthYear: input.birthYear === undefined ? undefined : Year.of(input.birthYear),
      deathYear: input.deathYear === undefined ? undefined : Year.of(input.deathYear),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(data: Composer): ComposerEntity {
    return new ComposerEntity({
      ...data,
      id: ComposerId.from(data.id),
      name: ComposerName.of(data.name),
      imageUrl: data.imageUrl === undefined ? undefined : Url.of(data.imageUrl),
      birthYear: data.birthYear === undefined ? undefined : Year.of(data.birthYear),
      deathYear: data.deathYear === undefined ? undefined : Year.of(data.deathYear),
    });
  }

  /** 作曲家名を訂正する。 */
  rename(name: string): ComposerEntity {
    return this.touched({ name: ComposerName.of(name) });
  }

  /** 時代区分を再分類する。`undefined` で分類を取り消す。 */
  reclassifyEra(era: PieceEra | undefined): ComposerEntity {
    if (era === undefined) {
      return this.touched({}, ["era"]);
    }
    return this.touched({ era });
  }

  /** 地域を再分類する。`undefined` で分類を取り消す。 */
  reclassifyRegion(region: PieceRegion | undefined): ComposerEntity {
    if (region === undefined) {
      return this.touched({}, ["region"]);
    }
    return this.touched({ region });
  }

  /** 肖像画像 URL を更新する。`undefined` で画像を取り外す。 */
  updateImage(imageUrl: string | undefined): ComposerEntity {
    if (imageUrl === undefined) {
      return this.touched({}, ["imageUrl"]);
    }
    return this.touched({ imageUrl: Url.of(imageUrl) });
  }

  /**
   * 生没年を記録する。`null` を渡したフィールドは登録解除（生年なら未登録に戻す、
   * 没年なら存命扱いに戻す）。`undefined` のフィールドは現状維持。
   */
  recordLifeSpan(
    birthYear: number | null | undefined,
    deathYear: number | null | undefined,
  ): ComposerEntity {
    const diff: Partial<ComposerProps> = {};
    const removed: OptionalComposerPropKey[] = [];

    if (birthYear === null) {
      removed.push("birthYear");
    } else if (birthYear !== undefined) {
      diff.birthYear = Year.of(birthYear);
    }
    if (deathYear === null) {
      removed.push("deathYear");
    } else if (deathYear !== undefined) {
      diff.deathYear = Year.of(deathYear);
    }
    return this.touched(diff, removed);
  }

  /**
   * Update*Input の partial 仕様を意図メソッドへ dispatch する。input にキーが
   * 含まれているフィールドのみ適用する（partial update なので順序は可換）。
   * API 仕様の「空文字でクリア」「null でクリア」もここで意図メソッドの引数に
   * 正規化する（ドメイン層は技術的なクリア表現を持たない）。
   */
  static applyRevisions(entity: ComposerEntity, input: UpdateComposerInput): ComposerEntity {
    let next = entity;
    if (input.name !== undefined) {
      next = next.rename(input.name);
    }
    if (input.era !== undefined) {
      next = next.reclassifyEra(input.era === "" ? undefined : input.era);
    }
    if (input.region !== undefined) {
      next = next.reclassifyRegion(input.region === "" ? undefined : input.region);
    }
    if (input.imageUrl !== undefined) {
      next = next.updateImage(input.imageUrl === "" ? undefined : input.imageUrl);
    }
    if (input.birthYear !== undefined || input.deathYear !== undefined) {
      next = next.recordLifeSpan(input.birthYear, input.deathYear);
    }
    return next;
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

  private touched(
    diff: Partial<ComposerProps>,
    removed: readonly OptionalComposerPropKey[] = [],
  ): ComposerEntity {
    const merged: ComposerProps = {
      ...this.props,
      ...diff,
      updatedAt: new Date().toISOString(),
    };
    if (removed.length === 0) {
      return new ComposerEntity(merged);
    }
    const removedSet = new Set<string>(removed);
    const filtered = Object.fromEntries(
      Object.entries(merged).filter(([key]) => !removedSet.has(key)),
    ) as ComposerProps;
    return new ComposerEntity(filtered);
  }
}
