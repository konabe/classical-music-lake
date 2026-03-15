import { describe, it, expect } from "vitest";
import { parseRequestBody } from "./parsing";

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
      "Request body must be a JSON object"
    );
  });

  it("数値の場合は 400 を投げる", () => {
    expect(() => parseRequestBody<TestInput>(42)).toThrow("Request body must be a JSON object");
  });

  it("オブジェクトの場合はそのまま返す", () => {
    expect(parseRequestBody<TestInput>({ name: "test", value: 1 })).toEqual({ name: "test", value: 1 });
  });

  it("空オブジェクトの場合はそのまま返す", () => {
    expect(parseRequestBody<TestInput>({})).toEqual({});
  });
});
