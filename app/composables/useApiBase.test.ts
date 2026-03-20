import { describe, it, expect, vi, beforeEach } from "vitest";
import { useApiBase } from "./useApiBase";

describe("useApiBase", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("文字列型の API ベース URL を返す", () => {
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: { apiBaseUrl: "" },
    }));
    const result = useApiBase();
    expect(typeof result).toBe("string");
  });

  it("テスト環境では NUXT_PUBLIC_API_BASE_URL 未設定のため空文字列を返す", () => {
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: { apiBaseUrl: "" },
    }));
    const result = useApiBase();
    expect(result).toBe("");
  });

  it("末尾のスラッシュを削除する", () => {
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: { apiBaseUrl: "https://api.example.com/" },
    }));
    const result = useApiBase();
    expect(result).toBe("https://api.example.com");
  });

  it("末尾にスラッシュがない場合はそのまま返す", () => {
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: { apiBaseUrl: "https://api.example.com" },
    }));
    const result = useApiBase();
    expect(result).toBe("https://api.example.com");
  });
});
