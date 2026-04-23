import { describe, it, expect } from "vitest";

import { Rating } from "./rating";

describe("Rating", () => {
  describe("of", () => {
    it.each([1, 2, 3, 4, 5])("%i を受理して値を保持する", (value) => {
      const rating = Rating.of(value);
      expect(rating.value).toBe(value);
      expect(String(rating)).toBe(String(value));
    });

    it.each([0, 6, -1, 100])("範囲外の整数 %i を拒否する", (value) => {
      expect(() => Rating.of(value)).toThrow(RangeError);
    });

    it.each([1.5, 2.1, Number.NaN, Number.POSITIVE_INFINITY])("非整数 %s を拒否する", (value) => {
      expect(() => Rating.of(value)).toThrow(RangeError);
    });
  });

  describe("equals", () => {
    it("同じ値の Rating は等しい", () => {
      expect(Rating.of(4).equals(Rating.of(4))).toBe(true);
    });

    it("異なる値の Rating は等しくない", () => {
      expect(Rating.of(3).equals(Rating.of(5))).toBe(false);
    });

    it("Rating 以外のオブジェクトとは等しくない", () => {
      const rating = Rating.of(3);
      expect(rating.equals({ value: 3 } as unknown as Rating)).toBe(false);
    });
  });
});
