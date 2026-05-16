import type {
  Composer,
  CreateComposerInput,
  PieceEra,
  PieceRegion,
  UpdateComposerInput,
} from "@/types";
import { Entity, type EntityProps } from "@/domain/entity";
import { buildUpdateProps } from "@/domain/entity-helpers";
import { ComposerName } from "@/domain/value-objects/composer-name";
import { ComposerId } from "@/domain/value-objects/ids";
import { Url } from "@/domain/value-objects/url";
import { Year } from "@/domain/value-objects/year";

export type ComposerRepository = {
  findById(id: ComposerId): Promise<Composer | undefined>;
  /**
   * 複数 ID をまとめて取得する（重複は呼び出し側で排除する前提）。
   * 戻り値は見つかったものだけを含み、`id` の順序は保証しない。
   * 現状は `Promise.all(findById)` の並列発行で、BatchGetItem への差し替え用フック。
   */
  findByIds(ids: readonly ComposerId[]): Promise<Composer[]>;
  findPage(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<{ items: Composer[]; lastEvaluatedKey?: Record<string, unknown> }>;
  save(item: Composer): Promise<void>;
  saveWithOptimisticLock(item: Composer, prevUpdatedAt: string): Promise<void>;
  remove(id: ComposerId): Promise<void>;
};

/**
 * 作曲家マスタの基本情報を編集する差分。
 * 名前を訂正する／時代区分を再分類する／地域を再分類する／生没年を記録するは
 * すべて「マスタ情報を編集する」というマスタ管理者の単一の意図に帰着するため、
 * フィールドごとに意図メソッドを生やさず 1 つの `editProfile` に集約する。
 * 肖像画像 URL は外部リソース参照を貼り替える独立した意図なので、ここには含めない。
 */
export type ComposerProfileRevision = Omit<UpdateComposerInput, "imageUrl">;

type ComposerProps = EntityProps<ComposerId> & {
  name: ComposerName;
  era?: PieceEra;
  region?: PieceRegion;
  imageUrl?: Url;
  birthYear?: Year;
  deathYear?: Year;
};

const PROFILE_CLEARABLE_FIELDS = ["era", "region", "birthYear", "deathYear"] as const;

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

  /**
   * マスタ情報を編集する。名前・時代区分・地域・生没年の訂正や記録、取り消しを
   * 1 つの編集操作として扱う。`era` / `region` は空文字、`birthYear` / `deathYear`
   * は `null` を渡すと当該フィールドが削除される（API 仕様と一致）。
   */
  editProfile(revision: ComposerProfileRevision): ComposerEntity {
    const merged = buildUpdateProps(this.toPlain(), revision, PROFILE_CLEARABLE_FIELDS);
    return ComposerEntity.reconstruct(merged);
  }

  /** 肖像画像 URL を更新する。`undefined` で画像を取り外す。 */
  updateImage(imageUrl: string | undefined): ComposerEntity {
    const now = new Date().toISOString();
    if (imageUrl === undefined) {
      const { imageUrl: _omit, ...rest } = this.props;
      return new ComposerEntity({ ...rest, updatedAt: now });
    }
    return new ComposerEntity({
      ...this.props,
      imageUrl: Url.of(imageUrl),
      updatedAt: now,
    });
  }

  /**
   * Update*Input の partial 仕様を `editProfile` と `updateImage` の 2 系統に
   * dispatch する。肖像画像だけが意図として独立しており、それ以外は編集業務に
   * 集約する。API 仕様の「imageUrl は空文字でクリア」もここで `undefined` に
   * 正規化し、ドメイン層には漏らさない。
   */
  static applyRevisions(entity: ComposerEntity, input: UpdateComposerInput): ComposerEntity {
    let next = entity;
    const { imageUrl, ...profile } = input;

    if (Object.keys(profile).length > 0) {
      next = next.editProfile(profile);
    }
    if (imageUrl !== undefined) {
      next = next.updateImage(imageUrl === "" ? undefined : imageUrl);
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
}
