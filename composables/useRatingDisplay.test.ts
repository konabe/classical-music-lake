import { describe, it, expect } from "vitest";
import { useRatingDisplay } from "./useRatingDisplay";

describe("useRatingDisplay", () => {
  it("ratingStars: 評価0のとき☆5つを返す", () => {
    const { ratingStars } = useRatingDisplay();
    expect(ratingStars(0)).toBe("☆☆☆☆☆");
  });

  it("ratingStars: 評価3のとき★3つと☆2つを返す", () => {
    const { ratingStars } = useRatingDisplay();
    expect(ratingStars(3)).toBe("★★★☆☆");
  });

  it("ratingStars: 評価5のとき★5つを返す", () => {
    const { ratingStars } = useRatingDisplay();
    expect(ratingStars(5)).toBe("★★★★★");
  });
});
