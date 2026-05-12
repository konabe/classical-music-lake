import type {
  CreateMovementInput,
  CreatePieceInput,
  CreateWorkInput,
  Piece,
  PieceEra,
  PieceFormation,
  PieceGenre,
  PieceMovement,
  PieceRegion,
  PieceWork,
  UpdateMovementInput,
  UpdatePieceInput,
  UpdateWorkInput,
} from "../types";
import { Entity, type EntityProps } from "./entity";
import { buildUpdateProps } from "./entity-helpers";
import { ComposerId, PieceId } from "./value-objects/ids";
import { MovementIndex } from "./value-objects/movement-index";
import { PieceTitle } from "./value-objects/piece-title";
import { Url } from "./value-objects/url";

const WORK_METADATA_CLEARABLE_FIELDS = ["genre", "era", "formation", "region"] as const;

/**
 * 楽曲（Work）のメタデータを編集する差分。
 * 曲名・作曲家・カテゴリ系（genre / era / formation / region）の訂正は
 * 「マスタ管理者がメタデータを編集する」という単一の意図に帰着するため、
 * フィールドごとに意図メソッドを生やさず 1 つの `editMetadata` に集約する。
 * 動画 URL は外部リソース参照を貼り替える独立した意図なので、ここには含めない。
 */
export type PieceWorkMetadataRevision = Omit<UpdateWorkInput, "kind" | "videoUrls">;

/**
 * 楽章（Movement）のメタデータを編集する差分。
 * 楽章名・親 Work 参照・演奏順 index の訂正は単一の編集意図に集約する。
 * 動画 URL は外部リソース参照なので別メソッドで扱う。
 */
export type PieceMovementMetadataRevision = Omit<UpdateMovementInput, "kind" | "videoUrls">;

/**
 * リポジトリ I/F。Composite 構造に合わせて root（Work）操作と子（Movement）操作を明確に分ける。
 *
 * - root 限定列挙: `findRootById` / `findRootPage` は Work のみを返す（Movement は除外）
 * - `removeWorkCascade(id)`: Work 削除時に配下 Movement もまとめて削除
 * - `findChildren(parentId)`: 親 Work 配下の Movement を `index` 昇順で全件取得
 *   （新 GSI `parentId-index-index` を Query。楽章は最大 {@link MOVEMENTS_PER_WORK_MAX} 件想定）
 * - Movement 単体取得は `findById`（kind-agnostic）で行う
 * - `replaceMovements(workId, movements)`: Movement 集合をアトミックに置換（PR3 で使用）
 */
export type PieceRepository = {
  /** Work のみを返す（Movement は undefined を返す）。 */
  findRootById(id: PieceId): Promise<PieceWork | undefined>;
  findRootPage(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<{ items: PieceWork[]; lastEvaluatedKey?: Record<string, unknown> }>;
  saveWork(work: PieceWork): Promise<void>;
  saveWorkWithOptimisticLock(work: PieceWork, prevUpdatedAt: string): Promise<void>;
  /** Work 削除時に配下 Movement をまとめて削除する。 */
  removeWorkCascade(id: PieceId): Promise<void>;

  /** kind を問わず id で取得する。Work でも Movement でも返す。 */
  findById(id: PieceId): Promise<Piece | undefined>;
  /** 親 Work 配下の Movement を `index` 昇順で全件取得する。 */
  findChildren(parentId: PieceId): Promise<PieceMovement[]>;
  saveMovement(movement: PieceMovement): Promise<void>;
  saveMovementWithOptimisticLock(movement: PieceMovement, prevUpdatedAt: string): Promise<void>;
  removeMovement(id: PieceId): Promise<void>;
  /**
   * Work 配下の Movement 集合を一括置換する。
   *
   * `workOptimisticLock` を渡すと Work の楽観的ロック付き Put（`updatedAt = :prevUpdatedAt`）を
   * 同一 TransactWriteItems に含めて Work の `updatedAt` も同時に進める。
   * 競合した場合はリポジトリ実装が 409 Conflict を投げる。
   */
  replaceMovements(
    workId: PieceId,
    movements: PieceMovement[],
    workOptimisticLock?: { work: PieceWork; prevUpdatedAt: string },
  ): Promise<void>;
};

function toUrlArray(values: readonly string[] | undefined): Url[] | undefined {
  if (values === undefined) {
    return undefined;
  }
  return values.map((v) => Url.of(v));
}

type PieceWorkProps = EntityProps<PieceId> & {
  title: PieceTitle;
  composerId: ComposerId;
  videoUrls?: Url[];
  genre?: PieceGenre;
  era?: PieceEra;
  formation?: PieceFormation;
  region?: PieceRegion;
};

type PieceMovementProps = EntityProps<PieceId> & {
  parentId: PieceId;
  index: MovementIndex;
  title: PieceTitle;
  videoUrls?: Url[];
};

/**
 * 楽曲コンポーネントの抽象基底。Work / Movement で共通する性質を集約する。
 *
 * - `kind` は具象クラスで literal 型として実装する（判別共用体のタグ）。
 * - `title` / `videoUrls` は両方が共通で持つ。
 * - `toPlain()` は派生クラスで実装する（戻り値の判別共用体型を保つため）。
 * - `kind` に基づいて Work / Movement を振り分けるファクトリ（`create` / `reconstruct` /
 *   `applyUpdate`）を static メソッドとして集約する。トップレベル関数を増やさず、
 *   コンポジット階層のエントリポイントを Component 自身に閉じ込める。
 */
export abstract class PieceComponent<
  TProps extends EntityProps<PieceId> & { title: PieceTitle; videoUrls?: Url[] },
> extends Entity<PieceId, TProps> {
  abstract get kind(): "work" | "movement";

  get title(): PieceTitle {
    return this.props.title;
  }

  get videoUrls(): readonly Url[] | undefined {
    return this.props.videoUrls;
  }

  abstract toPlain(): Piece;

  /**
   * 派生クラスが自身の具象型でインスタンスを再生成するためのフック。
   * `updateVideos` 等、props を貼り替えるだけの操作を基底クラスで共通実装するために使う。
   */
  protected abstract cloneWithProps(props: TProps): this;

  /**
   * 動画 URL の集合を貼り替える。`undefined` または空配列で動画を取り外す。
   * Work / Movement で実装が同一なので基底クラスに集約する。
   */
  updateVideos(videoUrls: readonly string[] | undefined): this {
    const now = new Date().toISOString();
    if (videoUrls === undefined || videoUrls.length === 0) {
      const { videoUrls: _omit, ...rest } = this.props;
      return this.cloneWithProps({ ...(rest as TProps), updatedAt: now });
    }
    return this.cloneWithProps({
      ...this.props,
      videoUrls: videoUrls.map((u) => Url.of(u)),
      updatedAt: now,
    });
  }

  /**
   * `CreatePieceInput` から適切な Entity を生成するファクトリ。
   * 判別共用体の `kind` で分岐する。`default` 節は `never` 型で網羅性をコンパイル時検証し、
   * 想定外の `kind` が渡された場合は例外を投げる。
   */
  static create(input: CreatePieceInput): PieceWorkEntity | PieceMovementEntity {
    switch (input.kind) {
      case "work":
        return PieceWorkEntity.create(input);
      case "movement":
        return PieceMovementEntity.create(input);
      default: {
        const exhaustive: never = input;
        throw new TypeError(`Unknown piece kind: ${JSON.stringify(exhaustive)}`);
      }
    }
  }

  /**
   * DTO（判別共用体 `Piece`）から Entity を再構築するファクトリ。
   * `default` 節は `never` 型で網羅性をコンパイル時検証する。
   */
  static reconstruct(data: Piece): PieceWorkEntity | PieceMovementEntity {
    switch (data.kind) {
      case "work":
        return PieceWorkEntity.reconstruct(data);
      case "movement":
        return PieceMovementEntity.reconstruct(data);
      default: {
        const exhaustive: never = data;
        throw new TypeError(`Unknown piece kind: ${JSON.stringify(exhaustive)}`);
      }
    }
  }

  /**
   * 既存 Entity に対して `UpdatePieceInput` を適用する。
   * 既存 Entity の kind と入力の kind が一致しない場合は例外を投げる
   * （Work ↔ Movement の昇格・降格は本 PR ではサポートしない）。
   */
  static applyUpdate(
    current: PieceWorkEntity | PieceMovementEntity,
    input: UpdatePieceInput,
  ): PieceWorkEntity | PieceMovementEntity {
    if (current instanceof PieceWorkEntity && input.kind === "work") {
      return PieceWorkEntity.applyRevisions(current, input);
    }
    if (current instanceof PieceMovementEntity && input.kind === "movement") {
      return PieceMovementEntity.applyRevisions(current, input);
    }
    throw new TypeError(
      `Piece kind mismatch: cannot update ${current.kind} with input of kind=${input.kind}`,
    );
  }
}

export class PieceWorkEntity extends PieceComponent<PieceWorkProps> {
  private constructor(props: PieceWorkProps) {
    super(props);
  }

  override get kind(): "work" {
    return "work";
  }

  protected override cloneWithProps(props: PieceWorkProps): this {
    return new PieceWorkEntity(props) as this;
  }

  static create(input: CreateWorkInput): PieceWorkEntity {
    const now = new Date().toISOString();
    return new PieceWorkEntity({
      ...input,
      id: PieceId.generate(),
      title: PieceTitle.of(input.title),
      composerId: ComposerId.from(input.composerId),
      videoUrls: toUrlArray(input.videoUrls),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(data: PieceWork): PieceWorkEntity {
    return new PieceWorkEntity({
      ...data,
      id: PieceId.from(data.id),
      title: PieceTitle.of(data.title),
      composerId: ComposerId.from(data.composerId),
      videoUrls: toUrlArray(data.videoUrls),
    });
  }

  /**
   * Work のメタデータを編集する。曲名・作曲家・カテゴリ系の訂正を 1 つの編集操作として扱う。
   * `genre` / `era` / `formation` / `region` は空文字を渡すと当該フィールドが削除される
   * （API 仕様と一致）。動画 URL はここでは扱わず `updateVideos` を使う。
   */
  editMetadata(revision: PieceWorkMetadataRevision): PieceWorkEntity {
    const merged = buildUpdateProps(this.toPlain(), revision, WORK_METADATA_CLEARABLE_FIELDS);
    return PieceWorkEntity.reconstruct(merged);
  }

  /**
   * `UpdateWorkInput` を `editMetadata` と `updateVideos` の 2 系統に dispatch する。
   * 動画 URL だけが意図として独立しており、それ以外は編集業務に集約する。
   * `updateVideos` は基底 `PieceComponent` の共通実装を使う。
   */
  static applyRevisions(entity: PieceWorkEntity, input: UpdateWorkInput): PieceWorkEntity {
    let next = entity;
    const { kind: _kind, videoUrls, ...metadata } = input;

    if (Object.keys(metadata).length > 0) {
      next = next.editMetadata(metadata);
    }
    if (videoUrls !== undefined) {
      next = next.updateVideos(videoUrls);
    }
    return next;
  }

  override toPlain(): PieceWork {
    return {
      ...this.props,
      kind: "work",
      id: this.props.id.value,
      title: this.props.title.value,
      composerId: this.props.composerId.value,
      videoUrls: this.props.videoUrls?.map((u) => u.value),
    };
  }
}

export class PieceMovementEntity extends PieceComponent<PieceMovementProps> {
  private constructor(props: PieceMovementProps) {
    super(props);
  }

  override get kind(): "movement" {
    return "movement";
  }

  protected override cloneWithProps(props: PieceMovementProps): this {
    return new PieceMovementEntity(props) as this;
  }

  get parentId(): PieceId {
    return this.props.parentId;
  }

  get index(): MovementIndex {
    return this.props.index;
  }

  static create(input: CreateMovementInput): PieceMovementEntity {
    const now = new Date().toISOString();
    return new PieceMovementEntity({
      id: PieceId.generate(),
      parentId: PieceId.from(input.parentId),
      index: MovementIndex.of(input.index),
      title: PieceTitle.of(input.title),
      videoUrls: toUrlArray(input.videoUrls),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(data: PieceMovement): PieceMovementEntity {
    return new PieceMovementEntity({
      id: PieceId.from(data.id),
      parentId: PieceId.from(data.parentId),
      index: MovementIndex.of(data.index),
      title: PieceTitle.of(data.title),
      videoUrls: toUrlArray(data.videoUrls),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  /**
   * Movement のメタデータを編集する。楽章名・親 Work 参照・演奏順 index の訂正を
   * 1 つの編集操作として扱う。動画 URL はここでは扱わず `updateVideos` を使う。
   */
  editMetadata(revision: PieceMovementMetadataRevision): PieceMovementEntity {
    const merged = buildUpdateProps(this.toPlain(), revision, []);
    return PieceMovementEntity.reconstruct(merged);
  }

  /**
   * `UpdateMovementInput` を `editMetadata` と `updateVideos` の 2 系統に dispatch する。
   * `updateVideos` は基底 `PieceComponent` の共通実装を使う。
   */
  static applyRevisions(
    entity: PieceMovementEntity,
    input: UpdateMovementInput,
  ): PieceMovementEntity {
    let next = entity;
    const { kind: _kind, videoUrls, ...metadata } = input;

    if (Object.keys(metadata).length > 0) {
      next = next.editMetadata(metadata);
    }
    if (videoUrls !== undefined) {
      next = next.updateVideos(videoUrls);
    }
    return next;
  }

  override toPlain(): PieceMovement {
    return {
      kind: "movement",
      id: this.props.id.value,
      parentId: this.props.parentId.value,
      index: this.props.index.value,
      title: this.props.title.value,
      videoUrls: this.props.videoUrls?.map((u) => u.value),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
