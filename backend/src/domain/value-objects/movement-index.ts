import { MOVEMENT_INDEX_MAX, MOVEMENT_INDEX_MIN } from "@shared/constants";

import { BoundedInteger } from "@/domain/value-objects/bounded-integer";

/**
 * Movement の演奏順を表す値オブジェクト。
 *
 * - 整数のみ受理（0 始まり）。
 * - 範囲は 0 〜 999。1 楽曲に持てる楽章数の現実的な上限を考慮。
 * - 値の取り出しは `.value` または `toString()`、等価判定は `.equals(other)`。
 */
export class MovementIndex extends BoundedInteger {
  private constructor(value: number) {
    super(value, "MovementIndex", MOVEMENT_INDEX_MIN, MOVEMENT_INDEX_MAX);
  }

  static of(value: number): MovementIndex {
    return new MovementIndex(value);
  }
}
