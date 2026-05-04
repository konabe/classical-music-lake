import { PieceMovementEntity } from "../domain/piece";
import type { PieceRepository } from "../domain/piece";
import { PieceId } from "../domain/value-objects/ids";
import { DynamoDBPieceRepository } from "../repositories/piece-repository";
import type { CreateMovementInput, PieceMovement, UpdateMovementInput } from "../types";
import { findByIdOrNotFound } from "./helpers";

// handlers 層は domain へ直接アクセスできないため、ID 値オブジェクトを usecase 層経由で公開する
export { PieceId };

const ENTITY_NAME = "Piece";

/**
 * 楽章（Movement）専用のユースケース。Composite モデルにおける子要素の CRUD と
 * Work 配下の Movement 集合のアトミック置換を扱う。
 *
 * - `replaceMovements` は新しい Movement 集合を Entity 化したうえで Repository に委譲する。
 * - 単体取得・kind 横断取得は {@link PieceUsecase.getNode} を参照すること。
 */
export class MovementUsecase {
  constructor(private readonly repo: PieceRepository) {}

  async create(input: CreateMovementInput): Promise<PieceMovement> {
    const entity = PieceMovementEntity.create(input);
    const plain = entity.toPlain();
    await this.repo.saveMovement(plain);
    return plain;
  }

  async update(id: PieceId, input: UpdateMovementInput): Promise<PieceMovement> {
    const current = await findByIdOrNotFound((id) => this.repo.findById(id), id, ENTITY_NAME);
    if (current.kind !== "movement") {
      // kind 不一致は呼び出し側のバグ。Work エンティティは Work usecase で更新する。
      throw new TypeError(`Piece kind mismatch: cannot update ${current.kind} with movement input`);
    }
    const updated = PieceMovementEntity.reconstruct(current).mergeUpdate(input);
    const plain = updated.toPlain();
    await this.repo.saveMovementWithOptimisticLock(plain, current.updatedAt);
    return plain;
  }

  async delete(id: PieceId): Promise<void> {
    await this.repo.removeMovement(id);
  }

  /**
   * Work 配下の Movement 集合をアトミックに置換する。
   * - 入力 `inputs` は `parentId` を持たない（呼び出し側で workId を確定するため）。
   * - 各要素を {@link PieceMovementEntity} に通すことで `index` / `title` / `videoUrls` の不変条件を保証。
   */
  async replaceMovements(
    workId: PieceId,
    inputs: ReadonlyArray<Omit<CreateMovementInput, "kind" | "parentId">>,
  ): Promise<PieceMovement[]> {
    const movements = inputs.map((input) =>
      PieceMovementEntity.create({
        kind: "movement",
        parentId: workId.value,
        index: input.index,
        title: input.title,
        videoUrls: input.videoUrls,
      }).toPlain(),
    );
    await this.repo.replaceMovements(workId, movements);
    return movements;
  }
}

export const createMovementUsecase = () => new MovementUsecase(new DynamoDBPieceRepository());
