import { Year } from "@/domain/value-objects/year";

describe("Year", () => {
  describe("of", () => {
    it.each([1770, 1827, 0, -750, 9999, -3000])("整数 %i を受理して値を保持する", (value) => {
      const year = Year.of(value);
      expect(year.value).toBe(value);
      expect(String(year)).toBe(String(value));
    });

    it.each([1.5, 2.1, Number.NaN, Number.POSITIVE_INFINITY])("非整数 %s を拒否する", (value) => {
      expect(() => Year.of(value)).toThrow(RangeError);
    });

    it.each([-3001, 10000, 99999])("範囲外の整数 %i を拒否する", (value) => {
      expect(() => Year.of(value)).toThrow(RangeError);
    });

    it("数値以外を拒否する", () => {
      expect(() => Year.of("1770" as unknown as number)).toThrow(RangeError);
    });
  });

  describe("equals", () => {
    it("同じ値の Year は等しい", () => {
      expect(Year.of(1770).equals(Year.of(1770))).toBe(true);
    });

    it("異なる値の Year は等しくない", () => {
      expect(Year.of(1770).equals(Year.of(1827))).toBe(false);
    });

    it("Year 以外のオブジェクトとは等しくない", () => {
      const year = Year.of(1770);
      expect(year.equals({ value: 1770 } as unknown as Year)).toBe(false);
    });
  });
});
