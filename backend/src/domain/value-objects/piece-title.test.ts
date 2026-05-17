import { PieceTitle } from "@/domain/value-objects/piece-title";

describe("PieceTitle", () => {
  describe("of", () => {
    it("非空文字列を受理して値を保持する", () => {
      const title = PieceTitle.of("交響曲第9番");
      expect(title.value).toBe("交響曲第9番");
      expect(String(title)).toBe("交響曲第9番");
    });

    it("前後の空白をトリムする", () => {
      const title = PieceTitle.of("  月光ソナタ  ");
      expect(title.value).toBe("月光ソナタ");
    });

    it("空文字を拒否する", () => {
      expect(() => PieceTitle.of("")).toThrow(RangeError);
    });

    it("空白のみの文字列を拒否する", () => {
      expect(() => PieceTitle.of("   ")).toThrow(RangeError);
    });

    it("200 文字ちょうどは受理する", () => {
      const value = "a".repeat(200);
      expect(PieceTitle.of(value).value).toBe(value);
    });

    it("201 文字以上を拒否する", () => {
      expect(() => PieceTitle.of("a".repeat(201))).toThrow(RangeError);
    });

    it("文字列以外を拒否する", () => {
      expect(() => PieceTitle.of(123 as unknown as string)).toThrow(TypeError);
    });
  });

  describe("equals", () => {
    it("同じ値の PieceTitle は等しい", () => {
      expect(PieceTitle.of("魔弾の射手").equals(PieceTitle.of("魔弾の射手"))).toBe(true);
    });

    it("異なる値の PieceTitle は等しくない", () => {
      expect(PieceTitle.of("ボレロ").equals(PieceTitle.of("ラ・ヴァルス"))).toBe(false);
    });

    it("PieceTitle 以外のオブジェクトとは等しくない", () => {
      const title = PieceTitle.of("運命");
      expect(title.equals({ value: "運命" } as unknown as PieceTitle)).toBe(false);
    });
  });
});
