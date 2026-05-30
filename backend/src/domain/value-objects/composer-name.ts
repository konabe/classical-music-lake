import { BoundedText } from "@/domain/value-objects/non-empty-text";

/**
 * 作曲家の名前を表す値オブジェクト。
 *
 * - 前後の空白を除去して保持する。
 * - 空文字（空白のみを含む）を拒否する。
 * - 最大 100 文字。
 */
const MAX_LENGTH = 100;

export class ComposerName extends BoundedText {
  private constructor(value: string) {
    super(value, "ComposerName", MAX_LENGTH);
  }

  static of(value: string): ComposerName {
    return new ComposerName(value);
  }
}
