import { useRatingDisplay } from "@/composables/useRatingDisplay";

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

  it("ratingStars: 評価が負数のとき☆5つを返す", () => {
    const { ratingStars } = useRatingDisplay();
    expect(ratingStars(-1)).toBe("☆☆☆☆☆");
  });

  it("ratingStars: 評価が5を超えるとき★5つを返す", () => {
    const { ratingStars } = useRatingDisplay();
    expect(ratingStars(6)).toBe("★★★★★");
  });

  it("ratingStars: 評価が小数のとき切り捨てて返す", () => {
    const { ratingStars } = useRatingDisplay();
    expect(ratingStars(2.9)).toBe("★★☆☆☆");
  });
});
