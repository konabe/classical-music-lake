import { describe, it, expect } from "vitest";

import { ComposerEntity } from "./composer";
import type { Composer, CreateComposerInput } from "../types";

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

  describe("rename", () => {
    it("name を訂正し updatedAt が進む", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.rename("Ludwig van Beethoven").toPlain();
      expect(next.name).toBe("Ludwig van Beethoven");
      expect(next.updatedAt).not.toBe(baseData.updatedAt);
    });

    it("空文字（trim 後 0 文字）は ComposerName で弾かれる", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      expect(() => entity.rename("   ")).toThrow();
    });

    it("他のフィールドは保持される", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.rename("Beethoven").toPlain();
      expect(next.era).toBe(baseData.era);
      expect(next.birthYear).toBe(baseData.birthYear);
    });

    it("イミュータブル（元エンティティは変化しない）", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      entity.rename("Beethoven");
      expect(entity.toPlain().name).toBe(baseData.name);
    });
  });

  describe("reclassifyEra", () => {
    it("era を別の時代区分に書き換える", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.reclassifyEra("ロマン派").toPlain();
      expect(next.era).toBe("ロマン派");
    });

    it("undefined を渡すと era フィールドが消える", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.reclassifyEra(undefined).toPlain();
      expect(next.era).toBeUndefined();
    });
  });

  describe("reclassifyRegion", () => {
    it("region を別の地域に書き換える", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.reclassifyRegion("フランス").toPlain();
      expect(next.region).toBe("フランス");
    });

    it("undefined を渡すと region フィールドが消える", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.reclassifyRegion(undefined).toPlain();
      expect(next.region).toBeUndefined();
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
  });

  describe("recordLifeSpan", () => {
    it("両方の年を更新する", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.recordLifeSpan(1685, 1750).toPlain();
      expect(next.birthYear).toBe(1685);
      expect(next.deathYear).toBe(1750);
    });

    it("birthYear に null を渡すと birthYear フィールドが消える", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.recordLifeSpan(null, undefined).toPlain();
      expect(next.birthYear).toBeUndefined();
      expect(next.deathYear).toBe(baseData.deathYear);
    });

    it("deathYear に null を渡すと存命扱いに戻す", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.recordLifeSpan(undefined, null).toPlain();
      expect(next.deathYear).toBeUndefined();
      expect(next.birthYear).toBe(baseData.birthYear);
    });

    it("両方 undefined なら現状維持（updatedAt のみ進む）", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = entity.recordLifeSpan(undefined, undefined).toPlain();
      expect(next.birthYear).toBe(baseData.birthYear);
      expect(next.deathYear).toBe(baseData.deathYear);
      expect(next.updatedAt).not.toBe(baseData.updatedAt);
    });

    it("範囲外の年は Year VO で弾かれる", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      expect(() => entity.recordLifeSpan(99999, undefined)).toThrow();
    });
  });

  describe("意図メソッドの不変条件", () => {
    it("id と createdAt はどの意図メソッドでも不変", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const checks = [
        entity.rename("X"),
        entity.reclassifyEra("ロマン派"),
        entity.reclassifyEra(undefined),
        entity.reclassifyRegion("フランス"),
        entity.reclassifyRegion(undefined),
        entity.updateImage("https://example.com/y.jpg"),
        entity.updateImage(undefined),
        entity.recordLifeSpan(1900, 1980),
        entity.recordLifeSpan(null, null),
      ];
      for (const c of checks) {
        const p = c.toPlain();
        expect(p.id).toBe(baseData.id);
        expect(p.createdAt).toBe(baseData.createdAt);
      }
    });
  });

  describe("applyRevisions", () => {
    it("input にキーが含まれるフィールドのみ意図メソッドへ dispatch する", () => {
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

    it("undefined のフィールドは元の値を保つ（partial update）", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = ComposerEntity.applyRevisions(entity, { name: "別名" }).toPlain();
      expect(next.name).toBe("別名");
      expect(next.era).toBe(baseData.era);
      expect(next.region).toBe(baseData.region);
      expect(next.imageUrl).toBe(baseData.imageUrl);
      expect(next.birthYear).toBe(baseData.birthYear);
      expect(next.deathYear).toBe(baseData.deathYear);
    });

    it("era に空文字を渡すと reclassifyEra(undefined) に dispatch されフィールドが消える", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = ComposerEntity.applyRevisions(entity, { era: "" }).toPlain();
      expect(next.era).toBeUndefined();
    });

    it("region に空文字を渡すとフィールドが消える", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = ComposerEntity.applyRevisions(entity, { region: "" }).toPlain();
      expect(next.region).toBeUndefined();
    });

    it("imageUrl に空文字を渡すとフィールドが消える", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = ComposerEntity.applyRevisions(entity, { imageUrl: "" }).toPlain();
      expect(next.imageUrl).toBeUndefined();
    });

    it("birthYear に null を渡すとフィールドが消える", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = ComposerEntity.applyRevisions(entity, { birthYear: null }).toPlain();
      expect(next.birthYear).toBeUndefined();
      expect(next.deathYear).toBe(baseData.deathYear);
    });

    it("deathYear に null を渡すと存命扱いに戻す", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = ComposerEntity.applyRevisions(entity, { deathYear: null }).toPlain();
      expect(next.deathYear).toBeUndefined();
      expect(next.birthYear).toBe(baseData.birthYear);
    });

    it("空の input なら entity をそのまま返す（updatedAt も変化しない）", () => {
      const entity = ComposerEntity.reconstruct(baseData);
      const next = ComposerEntity.applyRevisions(entity, {});
      expect(next).toBe(entity);
    });
  });
});
