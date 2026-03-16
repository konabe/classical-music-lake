import { describe, it, expect } from "vitest";
import { z } from "zod";
import { parseBody } from "./parseBody";

const testSchema = z.object({
  name: z.string(),
  value: z.any().superRefine((val, ctx) => {
    if (typeof val !== "number" || !Number.isInteger(val) || val < 1 || val > 5) {
      ctx.addIssue({ code: "custom", message: "value must be between 1 and 5" });
      return z.NEVER;
    }
  }),
});

describe("parseBody", () => {
  it("body が null の場合は 400 を返す", () => {
    expect(() => parseBody(null, testSchema)).toThrow("Request body is required");
  });

  it("不正な JSON の場合は 400 を返す", () => {
    expect(() => parseBody("invalid json", testSchema)).toThrow("Invalid JSON");
  });

  it("JSON が null の場合は 400 を返す", () => {
    expect(() => parseBody("null", testSchema)).toThrow("Request body must be a JSON object");
  });

  it("JSON が配列の場合は 400 を返す", () => {
    expect(() => parseBody("[]", testSchema)).toThrow("Request body must be a JSON object");
  });

  it("スキーマのバリデーションが失敗した場合は 400 を返す", () => {
    expect(() => parseBody('{"name":"test","value":6}', testSchema)).toThrow(
      "value must be between 1 and 5"
    );
  });

  it("型が合わない場合は 400 を返す", () => {
    expect(() => parseBody('{"name":"test","value":"bad"}', testSchema)).toThrow(
      "value must be between 1 and 5"
    );
  });

  it("正常なデータの場合はパース済みオブジェクトを返す", () => {
    const result = parseBody('{"name":"test","value":3}', testSchema);
    expect(result).toEqual({ name: "test", value: 3 });
  });
});
