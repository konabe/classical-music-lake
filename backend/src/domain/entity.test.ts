import { describe, expect, it } from "vitest";
import { Entity, type EntityProps } from "@/domain/entity";
import { ComposerId, PieceId } from "@/domain/value-objects/ids";

type DummyPieceProps = EntityProps<PieceId> & { label: string };
type DummyComposerProps = EntityProps<ComposerId> & { label: string };

class DummyPieceEntity extends Entity<PieceId, DummyPieceProps> {
  static of(id: PieceId, label = "x"): DummyPieceEntity {
    return new DummyPieceEntity({
      id,
      label,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    });
  }
}

class DummyComposerEntity extends Entity<ComposerId, DummyComposerProps> {
  static of(id: ComposerId): DummyComposerEntity {
    return new DummyComposerEntity({
      id,
      label: "y",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    });
  }
}

describe("Entity", () => {
  describe("getter", () => {
    it("id / createdAt / updatedAt を props から返す", () => {
      const id = PieceId.generate();
      const entity = DummyPieceEntity.of(id);
      expect(entity.id).toBe(id);
      expect(entity.createdAt).toBe("2026-01-01T00:00:00.000Z");
      expect(entity.updatedAt).toBe("2026-01-02T00:00:00.000Z");
    });
  });

  describe("equals", () => {
    it("同じクラス・同じ ID なら true を返す", () => {
      const id = PieceId.generate();
      const a = DummyPieceEntity.of(id, "a");
      const b = DummyPieceEntity.of(id, "b");
      expect(a.equals(b)).toBe(true);
    });

    it("同じクラスでも ID が異なれば false を返す", () => {
      const a = DummyPieceEntity.of(PieceId.generate());
      const b = DummyPieceEntity.of(PieceId.generate());
      expect(a.equals(b)).toBe(false);
    });

    it("異なるクラスでは ID 値が同じでも false を返す", () => {
      const value = "00000000-0000-0000-0000-000000000000";
      const piece = DummyPieceEntity.of(PieceId.from(value));
      const composer = DummyComposerEntity.of(ComposerId.from(value));
      expect(piece.equals(composer)).toBe(false);
    });

    it("Entity でないものを渡すと false を返す", () => {
      const entity = DummyPieceEntity.of(PieceId.generate());
      expect(entity.equals(null)).toBe(false);
      expect(entity.equals(undefined)).toBe(false);
      expect(entity.equals({ id: entity.id })).toBe(false);
    });
  });
});
