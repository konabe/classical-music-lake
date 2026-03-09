import { describe, it, expect } from "vitest";
import { usePieces } from "./usePieces";

describe("usePieces", () => {
  it("useFetch の結果を返す", async () => {
    const result = await usePieces();
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("error");
  });
});
