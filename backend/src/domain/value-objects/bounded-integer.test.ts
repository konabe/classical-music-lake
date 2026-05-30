import { MovementIndex } from "@/domain/value-objects/movement-index";
import { Year } from "@/domain/value-objects/year";

describe("BoundedInteger", () => {
  it("同じ値でも異なる具象クラス同士は等しくない", () => {
    expect(MovementIndex.of(5).equals(Year.of(5))).toBe(false);
  });

  it("同じ具象クラスかつ同じ値なら等しい", () => {
    expect(MovementIndex.of(5).equals(MovementIndex.of(5))).toBe(true);
  });

  it("プリミティブやプレーンオブジェクトとは等しくない", () => {
    expect(MovementIndex.of(5).equals(5)).toBe(false);
    expect(MovementIndex.of(5).equals({ value: 5 })).toBe(false);
  });
});
