import type { Composer, ListeningLog, Piece, PieceWork } from "../types";
import type { ListeningLogEntity } from "./listening-log";

/**
 * 鑑賞記録の詳細を表す読み取り専用集約。
 *
 * `ListeningLogEntity` 単体では `pieceId` しか持たないため、表示用の派生値
 * （楽曲タイトル・作曲家 ID・作曲家名）を関連エンティティから引き当てて公開する。
 *
 * - Movement の `pieceTitle` は「親 Work title - 楽章 title」に整形する
 * - Movement の `composerId` は親 Work から継承する
 *
 * 構築は `ListeningLogDetail.from()` で行い、必要なエンティティ群を一括で受け取る。
 * リポジトリには依存しない（ドメイン層の純粋性を保つ）ため、組み立てに必要な
 * fetch は usecase 層が責任を持つ。
 */
export class ListeningLogDetail {
  private constructor(
    private readonly log: ListeningLogEntity,
    private readonly piece: Piece,
    private readonly parentWork: PieceWork | null,
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
    piece: Piece,
    parentWork: PieceWork | null,
    composer: Composer,
  ): ListeningLogDetail {
    if (piece.kind === "movement" && parentWork === null) {
      throw new Error("ListeningLogDetail: Movement requires parentWork");
    }
    if (piece.kind === "movement" && parentWork.id !== piece.parentId) {
      throw new Error("ListeningLogDetail: parentWork.id must match piece.parentId");
    }
    return new ListeningLogDetail(log, piece, parentWork, composer);
  }

  private get pieceTitle(): string {
    if (this.piece.kind === "work") {
      return this.piece.title;
    }
    // Movement の場合、親 Work と楽章のタイトルを連結
    return `${this.parentWork!.title} - ${this.piece.title}`;
  }

  private get composerId(): string {
    return this.composer.id;
  }

  toPlain(): ListeningLog {
    const record = this.log.toPlain();
    return {
      ...record,
      pieceTitle: this.pieceTitle,
      composerId: this.composerId,
      composerName: this.composer.name,
    };
  }
}
