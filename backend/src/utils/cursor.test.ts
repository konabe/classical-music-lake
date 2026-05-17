import * as fc from "fast-check";

import { encodeCursor, decodeCursor, InvalidCursorError } from "@/utils/cursor";

describe("encodeCursor / decodeCursor", () => {
  it("LastEvaluatedKey をエンコードしてデコードすると元の値に戻る", () => {
    const key = { id: "00000000-0000-0000-0000-000000000000" };
    const encoded = encodeCursor(key);
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);

    const decoded = decodeCursor(encoded);
    expect(decoded).toEqual(key);
  });

  it("複数フィールドを持つキーもラウンドトリップできる", () => {
    const key = {
      userId: "user-1",
      createdAt: "2024-01-01T00:00:00.000Z",
      id: "piece-1",
    };
    const decoded = decodeCursor(encodeCursor(key));
    expect(decoded).toEqual(key);
  });

  it("任意のオブジェクトをラウンドトリップできる（プロパティベース）", () => {
    fc.assert(
      fc.property(
        fc.dictionary(fc.string({ minLength: 1, maxLength: 20 }), fc.string(), {
          minKeys: 1,
          maxKeys: 5,
        }),
        (key) => {
          const decoded = decodeCursor(encodeCursor(key));
          expect(decoded).toEqual(key);
        },
      ),
    );
  });

  it("エンコード結果は URL セーフな base64url（+, /, = を含まない）", () => {
    const key = { id: "piece-1" };
    const encoded = encodeCursor(key);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  describe("decodeCursor のエラーハンドリング", () => {
    it("空文字を渡すと InvalidCursorError を投げる", () => {
      expect(() => decodeCursor("")).toThrow(InvalidCursorError);
    });

    it("base64url として不正な文字列を渡すと InvalidCursorError を投げる", () => {
      expect(() => decodeCursor("!!!not base64!!!")).toThrow(InvalidCursorError);
    });

    it("base64url デコード後に JSON パースできない文字列を渡すと InvalidCursorError を投げる", () => {
      const notJson = Buffer.from("not a json", "utf8").toString("base64url");
      expect(() => decodeCursor(notJson)).toThrow(InvalidCursorError);
    });

    it("JSON は有効だが未知のバージョン番号の場合は InvalidCursorError を投げる", () => {
      const futureVersion = Buffer.from(
        JSON.stringify({ v: 999, k: { id: "1" } }),
        "utf8",
      ).toString("base64url");
      expect(() => decodeCursor(futureVersion)).toThrow(InvalidCursorError);
    });

    it("JSON は有効だがバージョン番号が欠損している場合は InvalidCursorError を投げる", () => {
      const noVersion = Buffer.from(JSON.stringify({ k: { id: "1" } }), "utf8").toString(
        "base64url",
      );
      expect(() => decodeCursor(noVersion)).toThrow(InvalidCursorError);
    });

    it("JSON は有効だがキー構造が欠損している場合は InvalidCursorError を投げる", () => {
      const noKey = Buffer.from(JSON.stringify({ v: 1 }), "utf8").toString("base64url");
      expect(() => decodeCursor(noKey)).toThrow(InvalidCursorError);
    });

    it("k がオブジェクトでない場合は InvalidCursorError を投げる", () => {
      const badKey = Buffer.from(JSON.stringify({ v: 1, k: "not an object" }), "utf8").toString(
        "base64url",
      );
      expect(() => decodeCursor(badKey)).toThrow(InvalidCursorError);
    });
  });

  describe("encodeCursor の入力", () => {
    it("空オブジェクトでもエンコードできる", () => {
      const encoded = encodeCursor({});
      expect(decodeCursor(encoded)).toEqual({});
    });
  });
});
