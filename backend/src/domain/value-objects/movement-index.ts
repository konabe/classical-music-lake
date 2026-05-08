/**
 * Movement の演奏順を表す値オブジェクト。
 *
 * - 整数のみ受理（0 始まり）。
 * - 範囲は 0 〜 999。1 楽曲に持てる楽章数の現実的な上限を考慮。
 * - 値の取り出しは `.value` または `toString()`、等価判定は `.equals(other)`。
 */
import { MOVEMENT_INDEX_MAX, MOVEMENT_INDEX_MIN } from "../../../../shared/constants";

export class MovementIndex {
  public readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static of(value: number): MovementIndex {
    if (typeof value !== "number" || !Number.isInteger(value)) {
      throw new RangeError("MovementIndex must be an integer");
    }
    if (value < MOVEMENT_INDEX_MIN || value > MOVEMENT_INDEX_MAX) {
      throw new RangeError(
        `MovementIndex must be between ${MOVEMENT_INDEX_MIN} and ${MOVEMENT_INDEX_MAX}`,
      );
    }
    return new MovementIndex(value);
  }

  equals(other: MovementIndex): boolean {
    return other instanceof MovementIndex && this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }
}
