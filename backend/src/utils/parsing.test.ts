import { describe, it, expect } from "vitest";
import { z } from "zod";
import { parseRequestBody } from "./parsing";

type TestInput = { name: string; value?: number };

describe("parseRequestBody", () => {
  it("null の場合は 400 を投げる", () => {
    expect(() => {
      return parseRequestBody<TestInput>(null);
    }).toThrow("Request body is required");
  });

  it("undefined の場合は 400 を投げる", () => {
    expect(() => {
      return parseRequestBody<TestInput>(undefined);
    }).toThrow("Request body is required");
  });

  it("配列の場合は 400 を投げる", () => {
    expect(() => {
      return parseRequestBody<TestInput>([]);
    }).toThrow("Request body must be a JSON object");
  });

  it("文字列の場合は 400 を投げる", () => {
    expect(() => {
      return parseRequestBody<TestInput>("string");
    }).toThrow("Request body must be a JSON object");
  });

  it("数値の場合は 400 を投げる", () => {
    expect(() => {
      return parseRequestBody<TestInput>(42);
    }).toThrow("Request body must be a JSON object");
  });

  it("オブジェクトの場合はそのまま返す", () => {
    expect(parseRequestBody<TestInput>({ name: "test", value: 1 })).toEqual({
      name: "test",
      value: 1,
    });
  });

  it("空オブジェクトの場合はそのまま返す", () => {
    expect(parseRequestBody<TestInput>({})).toEqual({});
  });

  describe("スキーマあり", () => {
    const schema = z.object({
      name: z.string({
        error: () => {
          return "name is required";
        },
      }),
      value: z.number().optional(),
    });

    it("スキーマに適合する場合はパース済みデータを返す", () => {
      const result = parseRequestBody({ name: "test", value: 1 }, schema);
      expect(result).toEqual({ name: "test", value: 1 });
    });

    it("スキーマに適合しない場合は 400 を投げる", () => {
      expect(() => {
        return parseRequestBody({}, schema);
      }).toThrow("name is required");
    });

    it("スキーマにない余分なフィールドは除去される", () => {
      const result = parseRequestBody({ name: "test", extra: "ignored" }, schema);
      expect(result).toEqual({ name: "test" });
    });
  });
});
