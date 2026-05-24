import { PieceTitle } from "@/domain/value-objects/piece-title";
import { Venue } from "@/domain/value-objects/venue";

describe("NonEmptyText / BoundedText", () => {
  it("同じ値でも異なる具象クラス同士は等しくない", () => {
    expect(PieceTitle.of("Symphony").equals(Venue.of("Symphony"))).toBe(false);
  });

  it("同じ具象クラスかつ同じ値なら等しい", () => {
    expect(PieceTitle.of("Symphony").equals(PieceTitle.of("Symphony"))).toBe(true);
  });

  it("プリミティブやプレーンオブジェクトとは等しくない", () => {
    expect(PieceTitle.of("Symphony").equals("Symphony")).toBe(false);
    expect(PieceTitle.of("Symphony").equals({ value: "Symphony" })).toBe(false);
  });
});
