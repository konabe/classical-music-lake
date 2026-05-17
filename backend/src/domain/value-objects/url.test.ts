import { Url } from "@/domain/value-objects/url";

describe("Url", () => {
  describe("of", () => {
    it("https URL を受理して値を保持する", () => {
      const url = Url.of("https://www.youtube.com/watch?v=abc123");
      expect(url.value).toBe("https://www.youtube.com/watch?v=abc123");
      expect(String(url)).toBe("https://www.youtube.com/watch?v=abc123");
    });

    it("http URL を受理する", () => {
      const url = Url.of("http://example.com");
      expect(url.value).toBe("http://example.com");
    });

    it("http/https 以外のスキーム（ftp など）も URL コンストラクタが許容すれば受理する", () => {
      const url = Url.of("ftp://example.com/resource");
      expect(url.value).toBe("ftp://example.com/resource");
    });

    it("前後の空白をトリムする", () => {
      const url = Url.of("  https://example.com  ");
      expect(url.value).toBe("https://example.com");
    });

    it("空文字を拒否する", () => {
      expect(() => Url.of("")).toThrow(RangeError);
    });

    it("空白のみの文字列を拒否する", () => {
      expect(() => Url.of("   ")).toThrow(RangeError);
    });

    it("スキームを含まない文字列を拒否する", () => {
      expect(() => Url.of("example.com")).toThrow(RangeError);
    });

    it("不正な URL 文字列を拒否する", () => {
      expect(() => Url.of("not-a-url")).toThrow(RangeError);
    });

    it("文字列以外を拒否する", () => {
      expect(() => Url.of(123 as unknown as string)).toThrow(TypeError);
    });
  });

  describe("equals", () => {
    it("同じ値の Url は等しい", () => {
      expect(Url.of("https://example.com").equals(Url.of("https://example.com"))).toBe(true);
    });

    it("異なる値の Url は等しくない", () => {
      expect(Url.of("https://example.com").equals(Url.of("https://example.org"))).toBe(false);
    });

    it("Url 以外のオブジェクトとは等しくない", () => {
      const url = Url.of("https://example.com");
      expect(url.equals({ value: "https://example.com" } as unknown as Url)).toBe(false);
    });
  });
});
