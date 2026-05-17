import { Venue } from "@/domain/value-objects/venue";

describe("Venue", () => {
  describe("of", () => {
    it("非空文字列を受理して値を保持する", () => {
      const venue = Venue.of("サントリーホール");
      expect(venue.value).toBe("サントリーホール");
      expect(String(venue)).toBe("サントリーホール");
    });

    it("前後の空白をトリムする", () => {
      const venue = Venue.of("  東京文化会館  ");
      expect(venue.value).toBe("東京文化会館");
    });

    it("空文字を拒否する", () => {
      expect(() => Venue.of("")).toThrow(RangeError);
    });

    it("空白のみの文字列を拒否する", () => {
      expect(() => Venue.of("   ")).toThrow(RangeError);
    });

    it("200 文字ちょうどは受理する", () => {
      const value = "a".repeat(200);
      expect(Venue.of(value).value).toBe(value);
    });

    it("201 文字以上を拒否する", () => {
      expect(() => Venue.of("a".repeat(201))).toThrow(RangeError);
    });

    it("文字列以外を拒否する", () => {
      expect(() => Venue.of(undefined as unknown as string)).toThrow(TypeError);
    });
  });

  describe("equals", () => {
    it("同じ値の Venue は等しい", () => {
      expect(Venue.of("NHKホール").equals(Venue.of("NHKホール"))).toBe(true);
    });

    it("異なる値の Venue は等しくない", () => {
      expect(Venue.of("ミューザ川崎").equals(Venue.of("オーチャードホール"))).toBe(false);
    });

    it("Venue 以外のオブジェクトとは等しくない", () => {
      const venue = Venue.of("フェスティバルホール");
      expect(venue.equals({ value: "フェスティバルホール" } as unknown as Venue)).toBe(false);
    });
  });
});
