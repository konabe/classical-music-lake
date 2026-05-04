import type { PieceRepository } from "../domain/piece";
import { PieceId } from "../domain/value-objects/ids";
import { DynamoDBPieceRepository } from "../repositories/piece-repository";
import type { CreatePieceInput, Paginated, Piece, PieceWork, UpdatePieceInput } from "../types";
import { findByIdOrNotFound } from "./helpers";
import { MovementUsecase } from "./movement-usecase";
import { WorkUsecase } from "./work-usecase";

// handlers 層は domain へ直接アクセスできないため、ID 値オブジェクトを usecase 層経由で公開する
export { PieceId };

const ENTITY_NAME = "Piece";

/**
 * 楽曲マスタの kind 横断ファサード。
 *
 * - 既存の `/pieces` ハンドラ群はこの facade 経由で {@link WorkUsecase} に委譲する。
 *   create / update のみ `kind=movement` 入力を {@link MovementUsecase} へ振り分けるが、
 *   list / get / delete は Work のみを対象とする（Movement の取り扱いは PR3 で
 *   専用エンドポイントへ分離する想定）。
 * - {@link getNode} は kind を問わずに単体取得するファサードメソッドで、PR3 の
 *   root 取得 API（Work + Movement のアグリゲート）から利用する。
 */
export class PieceUsecase {
  constructor(
    private readonly workUsecase: WorkUsecase,
    private readonly movementUsecase: MovementUsecase,
    private readonly repo: PieceRepository,
  ) {}

  async create(input: CreatePieceInput): Promise<Piece> {
    return input.kind === "work"
      ? this.workUsecase.create(input)
      : this.movementUsecase.create(input);
  }

  async list(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<Paginated<PieceWork>> {
    return this.workUsecase.list(options);
  }

  async get(id: PieceId): Promise<PieceWork> {
    return this.workUsecase.get(id);
  }

  async update(id: PieceId, input: UpdatePieceInput): Promise<Piece> {
    return input.kind === "work"
      ? this.workUsecase.update(id, input)
      : this.movementUsecase.update(id, input);
  }

  async delete(id: PieceId): Promise<void> {
    await this.workUsecase.delete(id);
  }

  /**
   * kind を問わず単体取得する。Work でも Movement でも返す。
   * 見つからなければ `404 Not Found` を投げる。PR3 で root アグリゲート API から利用する。
   */
  async getNode(id: PieceId): Promise<Piece> {
    return findByIdOrNotFound((id) => this.repo.findById(id), id, ENTITY_NAME);
  }
}

export const createPieceUsecase = (): PieceUsecase => {
  const repo = new DynamoDBPieceRepository();
  return new PieceUsecase(new WorkUsecase(repo), new MovementUsecase(repo), repo);
};
