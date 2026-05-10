import { describe, it, expect } from "vitest";

import { ConcertTitle } from "./concert-title";

describe("ConcertTitle", () => {
  describe("of", () => {
    it("非空文字列を受理して値を保持する", () => {
      const title = ConcertTitle.of("ベルリン・フィル来日公演");
      expect(title.value).toBe("ベルリン・フィル来日公演");
      expect(String(title)).toBe("ベルリン・フィル来日公演");
    });

    it("前後の空白をトリムする", () => {
      const title = ConcertTitle.of("  N響定期公演  ");
      expect(title.value).toBe("N響定期公演");
    });

    it("空文字を拒否する", () => {
      expect(() => ConcertTitle.of("")).toThrow(RangeError);
    });

    it("空白のみの文字列を拒否する", () => {
      expect(() => ConcertTitle.of("   ")).toThrow(RangeError);
    });

    it("200 文字ちょうどは受理する", () => {
      const value = "a".repeat(200);
      expect(ConcertTitle.of(value).value).toBe(value);
    });

    it("201 文字以上を拒否する", () => {
      expect(() => ConcertTitle.of("a".repeat(201))).toThrow(RangeError);
    });

    it("文字列以外を拒否する", () => {
      expect(() => ConcertTitle.of(undefined as unknown as string)).toThrow(TypeError);
    });
  });

  describe("equals", () => {
    it("同じ値の ConcertTitle は等しい", () => {
      expect(ConcertTitle.of("第九演奏会").equals(ConcertTitle.of("第九演奏会"))).toBe(true);
    });

    it("異なる値の ConcertTitle は等しくない", () => {
      expect(ConcertTitle.of("第九演奏会").equals(ConcertTitle.of("オペラ・ガラ"))).toBe(false);
    });

    it("ConcertTitle 以外のオブジェクトとは等しくない", () => {
      const title = ConcertTitle.of("チャイコフスキーの夕べ");
      expect(title.equals({ value: "チャイコフスキーの夕べ" } as unknown as ConcertTitle)).toBe(
        false,
      );
    });
  });
});
