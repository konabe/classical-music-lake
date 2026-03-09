import { describe, it, expect, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { usePieces } from "./usePieces";

const { mockUseFetch } = vi.hoisted(() => ({
  mockUseFetch: vi.fn(() => ({ data: { value: [] }, error: { value: null } })),
}));

mockNuxtImport("useApiBase", () => () => "/api");
mockNuxtImport("useFetch", () => mockUseFetch);

describe("usePieces", () => {
  it("正しい URL で useFetch を呼び出し、data と error を返す", () => {
    const result = usePieces();
    expect(mockUseFetch).toHaveBeenCalledWith("/api/pieces", expect.any(String));
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("error");
  });
});
