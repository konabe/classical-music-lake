import { describe, it, expect } from "vitest";
import { z } from "zod";
import { encodeCursor } from "@/utils/cursor";
import { parseListQuery, parseRequestBody } from "@/utils/parsing";

type TestInput = { name: string; value?: number };

describe("parseRequestBody", () => {
  it("null の場合は 400 を投げる", () => {
    expect(() => parseRequestBody<TestInput>(null)).toThrow("Request body is required");
  });

  it("undefined の場合は 400 を投げる", () => {
    expect(() => parseRequestBody<TestInput>(undefined)).toThrow("Request body is required");
  });

  it("配列の場合は 400 を投げる", () => {
    expect(() => parseRequestBody<TestInput>([])).toThrow("Request body must be a JSON object");
  });

  it("文字列の場合は 400 を投げる", () => {
    expect(() => parseRequestBody<TestInput>("string")).toThrow(
      "Request body must be a JSON object",
    );
  });

  it("数値の場合は 400 を投げる", () => {
    expect(() => parseRequestBody<TestInput>(42)).toThrow("Request body must be a JSON object");
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
      name: z.string({ error: () => "name is required" }),
      value: z.number().optional(),
    });

    it("スキーマに適合する場合はパース済みデータを返す", () => {
      const result = parseRequestBody({ name: "test", value: 1 }, schema);
      expect(result).toEqual({ name: "test", value: 1 });
    });

    it("スキーマに適合しない場合は 400 を投げる", () => {
      expect(() => parseRequestBody({}, schema)).toThrow("name is required");
    });

    it("スキーマにない余分なフィールドは除去される", () => {
      const result = parseRequestBody({ name: "test", extra: "ignored" }, schema);
      expect(result).toEqual({ name: "test" });
    });
  });
});

describe("parseListQuery", () => {
  const schema = z.object({
    limit: z.coerce
      .number({ error: () => "limit must be a number" })
      .int({ message: "limit must be an integer" })
      .min(1, { message: "limit must be at least 1" })
      .max(100, { message: "limit must be at most 100" })
      .default(50),
    cursor: z.base64url({ message: "cursor must be a base64url string" }).min(1).optional(),
  });

  it("クエリ未指定の場合は既定 limit と undefined の exclusiveStartKey を返す", () => {
    expect(parseListQuery(null, schema)).toEqual({ limit: 50, exclusiveStartKey: undefined });
    expect(parseListQuery(undefined, schema)).toEqual({ limit: 50, exclusiveStartKey: undefined });
    expect(parseListQuery({}, schema)).toEqual({ limit: 50, exclusiveStartKey: undefined });
  });

  it("limit を数値に変換して返す", () => {
    expect(parseListQuery({ limit: "20" }, schema)).toEqual({
      limit: 20,
      exclusiveStartKey: undefined,
    });
  });

  it("cursor を decodeCursor でデコードして返す", () => {
    const cursor = encodeCursor({ id: "prev-id" });
    expect(parseListQuery({ cursor }, schema)).toEqual({
      limit: 50,
      exclusiveStartKey: { id: "prev-id" },
    });
  });

  it("スキーマ違反（範囲外 limit）の場合は 400 を投げる", () => {
    expect(() => parseListQuery({ limit: "0" }, schema)).toThrow("limit must be at least 1");
  });

  it("スキーマ違反（非数値 limit）の場合は 400 を投げる", () => {
    expect(() => parseListQuery({ limit: "abc" }, schema)).toThrow();
  });

  it("base64url として不正な cursor は 400 を投げる", () => {
    expect(() => parseListQuery({ cursor: "!!!invalid!!!" }, schema)).toThrow(
      "cursor must be a base64url string",
    );
  });

  it("バージョン不一致の cursor は 400 を投げる", () => {
    const cursor = Buffer.from(JSON.stringify({ v: 999, k: { id: "1" } }), "utf8").toString(
      "base64url",
    );
    expect(() => parseListQuery({ cursor }, schema)).toThrow(/Unsupported cursor version/);
  });
});
