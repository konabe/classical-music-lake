import { describe, it, expect } from "vitest";
import { useApiBase } from "./useApiBase";

describe("useApiBase", () => {
  it("文字列型の API ベース URL を返す", () => {
    const result = useApiBase();
    expect(typeof result).toBe("string");
  });

  it("テスト環境では NUXT_PUBLIC_API_BASE_URL 未設定のため空文字列を返す", () => {
    const result = useApiBase();
    expect(result).toBe("");
  });
});
