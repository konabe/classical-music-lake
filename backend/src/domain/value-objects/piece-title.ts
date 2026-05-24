import { BoundedText } from "@/domain/value-objects/non-empty-text";

/**
 * 楽曲のタイトルを表す値オブジェクト。
 *
 * - 前後の空白を除去して保持する。
 * - 空文字（空白のみを含む）を拒否する。
 * - 最大 200 文字。
 *
 * プリミティブな `string` との混同を型システムで抑止し、タイトルとしての
 * 不変条件をドメイン層で単独に保証する。
 */
const MAX_LENGTH = 200;

export class PieceTitle extends BoundedText {
  private constructor(value: string) {
    super(value, "PieceTitle", MAX_LENGTH);
  }

  static of(value: string): PieceTitle {
    return new PieceTitle(value);
  }
}
