import { describe, it, expect } from "vitest";

import { ComposerName } from "./composer-name";

describe("ComposerName", () => {
  describe("of", () => {
    it("非空文字列を受理して値を保持する", () => {
      const name = ComposerName.of("ベートーヴェン");
      expect(name.value).toBe("ベートーヴェン");
      expect(String(name)).toBe("ベートーヴェン");
    });

    it("前後の空白をトリムする", () => {
      const name = ComposerName.of("  モーツァルト  ");
      expect(name.value).toBe("モーツァルト");
    });

    it("空文字を拒否する", () => {
      expect(() => ComposerName.of("")).toThrow(RangeError);
    });

    it("空白のみの文字列を拒否する", () => {
      expect(() => ComposerName.of("   ")).toThrow(RangeError);
    });

    it("100 文字ちょうどは受理する", () => {
      const value = "a".repeat(100);
      expect(ComposerName.of(value).value).toBe(value);
    });

    it("101 文字以上を拒否する", () => {
      expect(() => ComposerName.of("a".repeat(101))).toThrow(RangeError);
    });

    it("文字列以外を拒否する", () => {
      expect(() => ComposerName.of(null as unknown as string)).toThrow(TypeError);
    });
  });

  describe("equals", () => {
    it("同じ値の ComposerName は等しい", () => {
      expect(ComposerName.of("バッハ").equals(ComposerName.of("バッハ"))).toBe(true);
    });

    it("異なる値の ComposerName は等しくない", () => {
      expect(ComposerName.of("ショパン").equals(ComposerName.of("リスト"))).toBe(false);
    });

    it("ComposerName 以外のオブジェクトとは等しくない", () => {
      const name = ComposerName.of("ブラームス");
      expect(name.equals({ value: "ブラームス" } as unknown as ComposerName)).toBe(false);
    });
  });
});
