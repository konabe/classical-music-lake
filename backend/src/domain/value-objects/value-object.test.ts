import { PieceId } from "@/domain/value-objects/ids";
import { MovementIndex } from "@/domain/value-objects/movement-index";
import { PieceTitle } from "@/domain/value-objects/piece-title";

describe("ValueObject (root)", () => {
  it("異なる系統の VO 同士は等しくない（テキスト × 数値 × ID）", () => {
    expect(PieceTitle.of("x").equals(MovementIndex.of(1))).toBe(false);
    expect(MovementIndex.of(1).equals(PieceId.from("x"))).toBe(false);
    expect(PieceId.from("x").equals(PieceTitle.of("x"))).toBe(false);
  });

  it("プリミティブ・プレーンオブジェクト・null とは等しくない", () => {
    const vo = PieceTitle.of("x");
    expect(vo.equals("x")).toBe(false);
    expect(vo.equals({ value: "x" })).toBe(false);
    expect(vo.equals(null)).toBe(false);
    expect(vo.equals(undefined)).toBe(false);
  });
});
