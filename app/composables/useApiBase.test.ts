import { describe, it, expect, vi } from "vitest";

interface MockConfig {
  public: { apiBaseUrl: string };
}

vi.mock("#app", () => ({
  useRuntimeConfig: vi.fn(),
}));

describe("useApiBase", () => {
  it("文字列型の API ベース URL を返す", async () => {
    const { useRuntimeConfig } = await import("#app");
    vi.mocked(useRuntimeConfig).mockReturnValue({
      public: { apiBaseUrl: "" },
    } as unknown as MockConfig);
    const { useApiBase } = await import("./useApiBase");
    const result = useApiBase();
    expect(typeof result).toBe("string");
  });

  it("テスト環境では NUXT_PUBLIC_API_BASE_URL 未設定のため空文字列を返す", async () => {
    const { useRuntimeConfig } = await import("#app");
    vi.mocked(useRuntimeConfig).mockReturnValue({
      public: { apiBaseUrl: "" },
    } as unknown as MockConfig);
    const { useApiBase } = await import("./useApiBase");
    const result = useApiBase();
    expect(result).toBe("");
  });

  it("末尾のスラッシュを削除する", async () => {
    const { useRuntimeConfig } = await import("#app");
    vi.mocked(useRuntimeConfig).mockReturnValue({
      public: { apiBaseUrl: "https://api.example.com/" },
    } as unknown as MockConfig);
    vi.resetModules();
    const { useApiBase } = await import("./useApiBase");
    const result = useApiBase();
    expect(result).toBe("https://api.example.com");
  });

  it("末尾にスラッシュがない場合はそのまま返す", async () => {
    const { useRuntimeConfig } = await import("#app");
    vi.mocked(useRuntimeConfig).mockReturnValue({
      public: { apiBaseUrl: "https://api.example.com" },
    } as unknown as MockConfig);
    vi.resetModules();
    const { useApiBase } = await import("./useApiBase");
    const result = useApiBase();
    expect(result).toBe("https://api.example.com");
  });
});
