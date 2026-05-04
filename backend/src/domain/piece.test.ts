import { describe, it, expect } from "vitest";

import { PieceComponent, PieceMovementEntity, PieceWorkEntity } from "./piece";
import { PieceId } from "./value-objects/ids";
import type { CreateMovementInput, CreateWorkInput, PieceMovement, PieceWork } from "../types";

const COMPOSER_ID = "00000000-0000-4000-8000-000000000001";
const PARENT_ID = "00000000-0000-4000-8000-0000000000aa";

const makeWorkInput = (overrides: Partial<CreateWorkInput> = {}): CreateWorkInput => ({
  kind: "work",
  title: "交響曲第9番",
  composerId: COMPOSER_ID,
  ...overrides,
});

const makeMovementInput = (overrides: Partial<CreateMovementInput> = {}): CreateMovementInput => ({
  kind: "movement",
  parentId: PARENT_ID,
  index: 0,
  title: "第1楽章",
  ...overrides,
});

describe("PieceWorkEntity", () => {
  it("create で id・createdAt・updatedAt が付与される", () => {
    const entity = PieceWorkEntity.create(makeWorkInput());
    const plain = entity.toPlain();
    expect(plain.kind).toBe("work");
    expect(plain.id).toBeDefined();
    expect(plain.createdAt).toBeDefined();
    expect(plain.updatedAt).toBeDefined();
    expect(plain.title).toBe("交響曲第9番");
    expect(plain.composerId).toBe(COMPOSER_ID);
  });

  it("reconstruct は与えた id / createdAt / updatedAt を保持する", () => {
    const data: PieceWork = {
      kind: "work",
      id: "abc",
      title: "ピアノ協奏曲",
      composerId: COMPOSER_ID,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    };
    const entity = PieceWorkEntity.reconstruct(data);
    const plain = entity.toPlain();
    expect(plain.id).toBe("abc");
    expect(plain.createdAt).toBe(data.createdAt);
    expect(plain.updatedAt).toBe(data.updatedAt);
  });

  it("mergeUpdate で title を更新できる", () => {
    const entity = PieceWorkEntity.create(makeWorkInput());
    const updated = entity.mergeUpdate({ kind: "work", title: "交響曲第5番" });
    expect(updated.toPlain().title).toBe("交響曲第5番");
  });

  it("mergeUpdate で era に空文字を渡すとフィールドが削除される", () => {
    const entity = PieceWorkEntity.create(makeWorkInput({ era: "古典派" }));
    const updated = entity.mergeUpdate({ kind: "work", era: "" });
    expect(updated.toPlain().era).toBeUndefined();
  });
});

describe("PieceMovementEntity", () => {
  it("create で kind=movement が付く", () => {
    const entity = PieceMovementEntity.create(makeMovementInput());
    const plain = entity.toPlain();
    expect(plain.kind).toBe("movement");
    expect(plain.parentId).toBe(PARENT_ID);
    expect(plain.index).toBe(0);
    expect(plain.title).toBe("第1楽章");
  });

  it("reconstruct で 与えた値を保持する", () => {
    const data: PieceMovement = {
      kind: "movement",
      id: "m-1",
      parentId: PARENT_ID,
      index: 2,
      title: "第3楽章",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };
    const entity = PieceMovementEntity.reconstruct(data);
    const plain = entity.toPlain();
    expect(plain.id).toBe("m-1");
    expect(plain.index).toBe(2);
    expect(plain.title).toBe("第3楽章");
  });

  it("mergeUpdate で title を更新できる", () => {
    const entity = PieceMovementEntity.create(makeMovementInput());
    const updated = entity.mergeUpdate({ kind: "movement", title: "Allegro" });
    expect(updated.toPlain().title).toBe("Allegro");
  });

  it("mergeUpdate で videoUrls を空配列で送るとフィールドが削除される", () => {
    const entity = PieceMovementEntity.create(
      makeMovementInput({ videoUrls: ["https://example.com/v"] }),
    );
    const updated = entity.mergeUpdate({ kind: "movement", videoUrls: [] });
    expect(updated.toPlain().videoUrls).toBeUndefined();
  });

  it("index に範囲外の値（-1）を渡すと例外", () => {
    expect(() => PieceMovementEntity.create(makeMovementInput({ index: -1 }))).toThrow(RangeError);
  });
});

describe("equals", () => {
  it("同じ kind / 同じ id の Work 同士は equals=true", () => {
    const id = PieceId.generate().value;
    const a = PieceWorkEntity.reconstruct({
      kind: "work",
      id,
      title: "x",
      composerId: COMPOSER_ID,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    const b = PieceWorkEntity.reconstruct({
      kind: "work",
      id,
      title: "y",
      composerId: COMPOSER_ID,
      createdAt: "2024-01-02T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    });
    expect(a.equals(b)).toBe(true);
  });

  it("同じ id でも Work と Movement は equals=false（具象クラスが異なる）", () => {
    const id = PieceId.generate().value;
    const work = PieceWorkEntity.reconstruct({
      kind: "work",
      id,
      title: "x",
      composerId: COMPOSER_ID,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    const movement = PieceMovementEntity.reconstruct({
      kind: "movement",
      id,
      parentId: PARENT_ID,
      index: 0,
      title: "x",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    expect(work.equals(movement)).toBe(false);
    expect(movement.equals(work)).toBe(false);
  });
});

describe("PieceComponent.create / PieceComponent.reconstruct", () => {
  it("kind=work の入力からは PieceWorkEntity を返す", () => {
    const entity = PieceComponent.create(makeWorkInput());
    expect(entity).toBeInstanceOf(PieceWorkEntity);
  });

  it("kind=movement の入力からは PieceMovementEntity を返す", () => {
    const entity = PieceComponent.create(makeMovementInput());
    expect(entity).toBeInstanceOf(PieceMovementEntity);
  });

  it("reconstruct も kind に応じた Entity を返す", () => {
    const w = PieceComponent.reconstruct({
      kind: "work",
      id: "1",
      title: "x",
      composerId: COMPOSER_ID,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    const m = PieceComponent.reconstruct({
      kind: "movement",
      id: "2",
      parentId: PARENT_ID,
      index: 0,
      title: "y",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });
    expect(w).toBeInstanceOf(PieceWorkEntity);
    expect(m).toBeInstanceOf(PieceMovementEntity);
  });
});

describe("PieceComponent.applyUpdate", () => {
  it("Work に Work 入力を適用できる", () => {
    const entity = PieceWorkEntity.create(makeWorkInput());
    const updated = PieceComponent.applyUpdate(entity, { kind: "work", title: "new" });
    expect(updated).toBeInstanceOf(PieceWorkEntity);
    expect(updated.toPlain().title).toBe("new");
  });

  it("Work に Movement 入力を適用すると例外", () => {
    const entity = PieceWorkEntity.create(makeWorkInput());
    expect(() => PieceComponent.applyUpdate(entity, { kind: "movement", title: "new" })).toThrow(
      TypeError,
    );
  });

  it("Movement に Work 入力を適用すると例外", () => {
    const entity = PieceMovementEntity.create(makeMovementInput());
    expect(() => PieceComponent.applyUpdate(entity, { kind: "work", title: "new" })).toThrow(
      TypeError,
    );
  });
});
