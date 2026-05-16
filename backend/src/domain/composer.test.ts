import { describe, it, expect } from "vitest";

import { ComposerEntity } from "@/domain/composer";
import type { Composer, CreateComposerInput } from "@/types";

const makeInput = (overrides: Partial<CreateComposerInput> = {}): CreateComposerInput => ({
  name: "ベートーヴェン",
  era: "古典派",
  region: "ドイツ・オーストリア",
  imageUrl: "https://example.com/beethoven.jpg",
  birthYear: 1770,
  deathYear: 1827,
  ...overrides,
});

const baseData: Composer = {
  id: "composer-1",
  name: "ベートーヴェン",
  era: "古典派",
  region: "ドイツ・オーストリア",
  imageUrl: "https://example.com/beethoven.jpg",
  birthYear: 1770,
  deathYear: 1827,
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("ComposerEntity", () => {
  it("create で id・createdAt・updatedAt が付与される", () => {
    const entity = ComposerEntity.create(makeInput());
    const plain = entity.toPlain();
    expect(plain.id).toBeDefined();
    expect(plain.name).toBe("ベートーヴェン");
    expect(plain.createdAt).toBeDefined();
    expect(plain.updatedAt).toBeDefined();
    expect(plain.birthYear).toBe(1770);
    expect(plain.deathYear).toBe(1827);
  });

  it("create で任意項目が undefined の場合は付与しない", () => {
    const entity = ComposerEntity.create(
      makeInput({
        era: undefined,
        region: undefined,
        imageUrl: undefined,
        birthYear: undefined,
        deathYear: undefined,
      }),
    );
    const plain = entity.toPlain();
    expect(plain.era).toBeUndefined();
    expect(plain.region).toBeUndefined();
    expect(plain.imageUrl).toBeUndefined();
    expect(plain.birthYear).toBeUndefined();
    expect(plain.deathYear).toBeUndefined();
  });

  it("reconstruct は与えた id / createdAt / updatedAt を保持する", () => {
    const entity = ComposerEntity.reconstruct(baseData);
    const plain = entity.toPlain();
    expect(plain.id).toBe("composer-1");
    expect(plain.createdAt).toBe(baseData.createdAt);
    expect(plain.updatedAt).toBe(baseData.updatedAt);
  });

  describe("editProfile", () => {
    it("name を訂正できる", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.editProfile({ name: "Ludwig van Beethoven" }).toPlain();
      expect(next.name).toBe("Ludwig van Beethoven");
      expect(next.updatedAt).not.toBe(baseData.updatedAt);
    });

    it("era / region を再分類できる", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.editProfile({ era: "ロマン派", region: "フランス" }).toPlain();
      expect(next.era).toBe("ロマン派");
      expect(next.region).toBe("フランス");
    });

    it("生没年をまとめて記録できる", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.editProfile({ birthYear: 1685, deathYear: 1750 }).toPlain();
      expect(next.birthYear).toBe(1685);
      expect(next.deathYear).toBe(1750);
    });

    it("era に空文字を渡すと era フィールドが消える", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.editProfile({ era: "" }).toPlain();
      expect(next.era).toBeUndefined();
    });

    it("region に空文字を渡すと region フィールドが消える", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.editProfile({ region: "" }).toPlain();
      expect(next.region).toBeUndefined();
    });

    it("birthYear に null を渡すと birthYear フィールドが消える", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.editProfile({ birthYear: null }).toPlain();
      expect(next.birthYear).toBeUndefined();
      expect(next.deathYear).toBe(baseData.deathYear);
    });

    it("deathYear に null を渡すと存命扱いに戻す", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.editProfile({ deathYear: null }).toPlain();
      expect(next.deathYear).toBeUndefined();
      expect(next.birthYear).toBe(baseData.birthYear);
    });

    it("imageUrl 以外の他フィールドは保持される", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.editProfile({ name: "別名" }).toPlain();
      expect(next.era).toBe(baseData.era);
      expect(next.region).toBe(baseData.region);
      expect(next.birthYear).toBe(baseData.birthYear);
      expect(next.imageUrl).toBe(baseData.imageUrl);
    });

    it("イミュータブル（元エンティティは変化しない）", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      entity.editProfile({ name: "別名" });
      expect(entity.toPlain().name).toBe(baseData.name);
    });
  });

  describe("updateImage", () => {
    it("imageUrl を別の URL に書き換える", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.updateImage("https://example.com/another.jpg").toPlain();
      expect(next.imageUrl).toBe("https://example.com/another.jpg");
    });

    it("undefined を渡すと imageUrl フィールドが消える", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.updateImage(undefined).toPlain();
      expect(next.imageUrl).toBeUndefined();
    });

    it("不正な URL は Url VO で弾かれる", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      expect(() => entity.updateImage("not-a-url")).toThrow();
    });

    it("updateImage は他フィールドを保持する", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.updateImage("https://example.com/x.jpg").toPlain();
      expect(next.name).toBe(baseData.name);
      expect(next.era).toBe(baseData.era);
      expect(next.birthYear).toBe(baseData.birthYear);
    });
  });

  describe("id / createdAt の不変性", () => {
    it("editProfile と updateImage のどちらでも id と createdAt は不変", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const checks = [
        entity.editProfile({ name: "X" }),
        entity.editProfile({ era: "", region: "" }),
        entity.editProfile({ birthYear: null, deathYear: null }),
        entity.updateImage("https://example.com/y.jpg"),
        entity.updateImage(undefined),
      ];
      for (const c of checks) {
        const p = c.toPlain();
        expect(p.id).toBe(baseData.id);
        expect(p.createdAt).toBe(baseData.createdAt);
      }
    });
  });

  describe("applyRevisions", () => {
    it("editProfile と updateImage の両方へ dispatch する", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = ComposerEntity.applyRevisions(entity, {
        name: "Ludwig",
        era: "ロマン派",
        region: "フランス",
        imageUrl: "https://example.com/z.jpg",
        birthYear: 1800,
        deathYear: 1900,
      }).toPlain();
      expect(next.name).toBe("Ludwig");
      expect(next.era).toBe("ロマン派");
      expect(next.region).toBe("フランス");
      expect(next.imageUrl).toBe("https://example.com/z.jpg");
      expect(next.birthYear).toBe(1800);
      expect(next.deathYear).toBe(1900);
    });

    it("imageUrl だけが渡された場合は editProfile に行かず updateImage だけ走る", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = ComposerEntity.applyRevisions(entity, {
        imageUrl: "https://example.com/only.jpg",
      }).toPlain();
      expect(next.imageUrl).toBe("https://example.com/only.jpg");
      expect(next.name).toBe(baseData.name);
      expect(next.era).toBe(baseData.era);
    });

    it("imageUrl に空文字を渡すと updateImage(undefined) に正規化される", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = ComposerEntity.applyRevisions(entity, { imageUrl: "" }).toPlain();
      expect(next.imageUrl).toBeUndefined();
    });

    it("空の input なら entity をそのまま返す（updatedAt も変化しない）", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = ComposerEntity.applyRevisions(entity, {});
      expect(next).toBe(entity);
    });
  });
});
