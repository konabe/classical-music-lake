import { MovementIndex } from "@/domain/value-objects/movement-index";

describe("MovementIndex", () => {
  describe("of", () => {
    it.each([0, 1, 2, 24, 999])("整数 %i を受理して値を保持する", (value) => {
      const index = MovementIndex.of(value);
      expect(index.value).toBe(value);
      expect(String(index)).toBe(String(value));
    });

    it.each([0.5, 1.1, Number.NaN, Number.POSITIVE_INFINITY])("非整数 %s を拒否する", (value) => {
      expect(() => MovementIndex.of(value)).toThrow(RangeError);
    });

    it.each([-1, -100, 1000, 99999])("範囲外の整数 %i を拒否する", (value) => {
      expect(() => MovementIndex.of(value)).toThrow(RangeError);
    });

    it("数値以外を拒否する", () => {
      expect(() => MovementIndex.of("0" as unknown as number)).toThrow(RangeError);
    });
  });

  describe("equals", () => {
    it("同じ値の MovementIndex は等しい", () => {
      expect(MovementIndex.of(2).equals(MovementIndex.of(2))).toBe(true);
    });

    it("異なる値の MovementIndex は等しくない", () => {
      expect(MovementIndex.of(2).equals(MovementIndex.of(3))).toBe(false);
    });

    it("MovementIndex 以外のオブジェクトとは等しくない", () => {
      const index = MovementIndex.of(2);
      expect(index.equals({ value: 2 } as unknown as MovementIndex)).toBe(false);
    });
  });
});
