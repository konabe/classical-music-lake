import { describe, it, expect, vi } from "vitest";
import { ok, created, notFound, badRequest, internalError, noContent } from "./response";

describe("response helpers", () => {
  describe("ok", () => {
    it("200 ステータスコードを返す", () => {
      const result = ok({ foo: "bar" });
      expect(result.statusCode).toBe(200);
    });

    it("ボディをオブジェクトで返す（JSON シリアライズは middy が担当）", () => {
      const result = ok({ foo: "bar" });
      expect(result.body).toEqual({ foo: "bar" });
    });
  });

  describe("created", () => {
    it("201 ステータスコードを返す", () => {
      const result = created({ id: "123" });
      expect(result.statusCode).toBe(201);
    });

    it("ボディをオブジェクトで返す（JSON シリアライズは middy が担当）", () => {
      const result = created({ id: "123" });
      expect(result.body).toEqual({ id: "123" });
    });
  });

  describe("notFound", () => {
    it("404 ステータスコードを返す", () => {
      const result = notFound("Not found");
      expect(result.statusCode).toBe(404);
    });

    it("メッセージをボディに含む", () => {
      const result = notFound("Not found");
      expect(result.body).toEqual({ message: "Not found" });
    });
  });

  describe("badRequest", () => {
    it("400 ステータスコードを返す", () => {
      const result = badRequest("Bad request");
      expect(result.statusCode).toBe(400);
    });

    it("メッセージをボディに含む", () => {
      const result = badRequest("Bad request");
      expect(result.body).toEqual({ message: "Bad request" });
    });
  });

  describe("internalError", () => {
    it("500 ステータスコードを返す", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const result = internalError(new Error("something went wrong"));
      expect(result.statusCode).toBe(500);
      consoleSpy.mockRestore();
    });

    it("汎用エラーメッセージを返す（詳細を漏洩しない）", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const result = internalError(new Error("DB connection failed"));
      expect(result.body).toEqual({ message: "Internal server error" });
      consoleSpy.mockRestore();
    });

    it("エラーを console.error に記録する", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("test error");
      internalError(error);
      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });
  });

  describe("noContent", () => {
    it("204 ステータスコードを返す", () => {
      const result = noContent();
      expect(result.statusCode).toBe(204);
    });

    it("空のボディを返す", () => {
      const result = noContent();
      expect(result.body).toBe("");
    });
  });
});
