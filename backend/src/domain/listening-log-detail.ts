import type { Composer, ListeningLog } from "../types";
import type { ListeningLogEntity } from "./listening-log";
import { PieceMovementEntity, type PieceWorkEntity } from "./piece";

type PieceEntity = PieceWorkEntity | PieceMovementEntity;

/**
 * 鑑賞記録の詳細を表す読み取り専用集約。
 *
 * `ListeningLogEntity` 単体では `pieceId` しか持たないため、表示用の派生値
 * （楽曲タイトル・作曲家 ID・作曲家名）を関連エンティティから引き当てて公開する。
 *
 * - Movement の `pieceTitle` は「親 Work title - 楽章 title」に整形する
 * - Movement の `composerId` は親 Work から継承する
 *
 * 表示名の整形は Piece 側の polymorphic メソッド（`displayNameUnder`）に委譲し、
 * 本集約には整形ロジックを持たない。
 */
export class ListeningLogDetail {
  private constructor(
    private readonly log: ListeningLogEntity,
    private readonly piece: PieceEntity,
    private readonly parentWork: PieceWorkEntity | null,
    private readonly composer: Composer,
  ) {}

  /**
   * @param log 対象の鑑賞ログ
   * @param piece `log.pieceId` が指す楽曲（Work / Movement のいずれか）
   * @param parentWork `piece` が Movement の場合の親 Work。Work のときは null
   * @param composer `piece` の `composerId`（Movement は親 Work から継承）が指す作曲家
   */
  static from(
    log: ListeningLogEntity,
    piece: PieceEntity,
    parentWork: PieceWorkEntity | null,
    composer: Composer,
  ): ListeningLogDetail {
    if (piece instanceof PieceMovementEntity && parentWork === null) {
      throw new Error("ListeningLogDetail: Movement requires parentWork");
    }
    if (
      piece instanceof PieceMovementEntity &&
      parentWork !== null &&
      !parentWork.id.equals(piece.parentId)
    ) {
      throw new Error("ListeningLogDetail: parentWork.id must match piece.parentId");
    }
    return new ListeningLogDetail(log, piece, parentWork, composer);
  }

  toPlain(): ListeningLog {
    const record = this.log.toPlain();
    return {
      ...record,
      pieceTitle: this.piece.displayNameUnder(this.parentWork),
      composerId: this.composer.id,
      composerName: this.composer.name,
    };
  }
}
