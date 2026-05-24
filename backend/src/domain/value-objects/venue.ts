import { BoundedText } from "@/domain/value-objects/non-empty-text";

/**
 * コンサートの開催会場名を表す値オブジェクト。
 *
 * - 前後の空白を除去して保持する。
 * - 空文字（空白のみを含む）を拒否する。
 * - 最大 200 文字。
 */
const MAX_LENGTH = 200;

export class Venue extends BoundedText {
  private constructor(value: string) {
    super(value, "Venue", MAX_LENGTH);
  }

  static of(value: string): Venue {
    return new Venue(value);
  }
}
