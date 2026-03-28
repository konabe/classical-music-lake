import { describe, it, expect } from "vitest";
import { ok, badRequest, tooManyRequests, internalError } from "./response";

describe("response helpers", () => {
  describe("ok", () => {
    it("200 ステータスコードを返す", () => {
      expect(ok({ message: "success" }).statusCode).toBe(200);
    });

    it("ボディをそのまま返す", () => {
      const body = { id: "abc", name: "test" };
      expect(ok(body).body).toEqual(body);
    });
  });

  describe("badRequest", () => {
    it("400 ステータスコードを返す", () => {
      expect(badRequest("ValidationError", "invalid input").statusCode).toBe(400);
    });

    it("error フィールドが設定される", () => {
      expect(badRequest("ValidationError", "invalid input").body.error).toBe("ValidationError");
    });

    it("message フィールドが設定される", () => {
      expect(badRequest("ValidationError", "invalid input").body.message).toBe("invalid input");
    });
  });

  describe("tooManyRequests", () => {
    it("429 ステータスコードを返す", () => {
      expect(tooManyRequests().statusCode).toBe(429);
    });

    it("error フィールドは TooManyRequests", () => {
      expect(tooManyRequests().body.error).toBe("TooManyRequests");
    });

    it("デフォルトメッセージを返す", () => {
      expect(tooManyRequests().body.message).toBe("Too many attempts. Please try again later.");
    });

    it("カスタムメッセージを渡せる", () => {
      expect(tooManyRequests("カスタムメッセージ").body.message).toBe("カスタムメッセージ");
    });
  });

  describe("internalError", () => {
    it("500 ステータスコードを返す", () => {
      expect(internalError().statusCode).toBe(500);
    });

    it("message が Internal server error である", () => {
      expect(internalError().body.message).toBe("Internal server error");
    });
  });
});
