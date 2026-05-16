import { describe, it, expect } from "vitest";

import { ListeningLogEntity } from "@/domain/listening-log";
import { UserId } from "@/domain/value-objects/ids";
import type { CreateListeningLogInput, ListeningLogRecord } from "@/types";

const USER_ID = "cognito-sub-user-1";
const OTHER_USER_ID = "cognito-sub-user-2";
const PIECE_ID_1 = "00000000-0000-4000-8000-000000000001";
const PIECE_ID_2 = "00000000-0000-4000-8000-000000000002";

const makeInput = (overrides: Partial<CreateListeningLogInput> = {}): CreateListeningLogInput => ({
  userId: USER_ID,
  listenedAt: "2024-01-15T20:00:00.000Z",
  pieceId: PIECE_ID_1,
  rating: 4,
  isFavorite: false,
  ...overrides,
});

const baseData: ListeningLogRecord = {
  id: "ll-1",
  userId: USER_ID,
  listenedAt: "2024-01-15T20:00:00.000Z",
  pieceId: PIECE_ID_1,
  rating: 4,
  isFavorite: false,
  memo: "良い演奏",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("ListeningLogEntity", () => {
  it("create で id・createdAt・updatedAt が付与される", () => {
    const entity = ListeningLogEntity.create(makeInput());
    const plain = entity.toPlain();
    expect(plain.id).toBeDefined();
    expect(plain.userId).toBe(USER_ID);
    expect(plain.createdAt).toBeDefined();
    expect(plain.updatedAt).toBeDefined();
    expect(plain.rating).toBe(4);
  });

  it("reconstruct は与えた id / createdAt / updatedAt を保持する", () => {
    const entity = ListeningLogEntity.reconstruct(baseData);
    const plain = entity.toPlain();
    expect(plain.id).toBe("ll-1");
    expect(plain.createdAt).toBe(baseData.createdAt);
    expect(plain.updatedAt).toBe(baseData.updatedAt);
  });

  describe("markAsFavorite / unmarkAsFavorite", () => {
    it("markAsFavorite で isFavorite が true になり updatedAt が進む", () => {
      const entity = ListeningLogEntity.reconstruct(baseData);
      const next = entity.markAsFavorite().toPlain();
      expect(next.isFavorite).toBe(true);
      expect(next.updatedAt).not.toBe(baseData.updatedAt);
    });

    it("unmarkAsFavorite で isFavorite が false になる", () => {
      const entity = ListeningLogEntity.reconstruct({ ...baseData, isFavorite: true });
      const next = entity.unmarkAsFavorite().toPlain();
      expect(next.isFavorite).toBe(false);
    });

    it("他のフィールドは保持される", () => {
      const entity = ListeningLogEntity.reconstruct(baseData);
      const next = entity.markAsFavorite().toPlain();
      expect(next.rating).toBe(baseData.rating);
      expect(next.memo).toBe(baseData.memo);
      expect(next.listenedAt).toBe(baseData.listenedAt);
      expect(next.pieceId).toBe(baseData.pieceId);
    });

    it("イミュータブル（元エンティティは変化しない）", () => {
      const entity = ListeningLogEntity.reconstruct(baseData);
      entity.markAsFavorite();
      expect(entity.toPlain().isFavorite).toBe(false);
    });
  });

  describe("rerate", () => {
    it("rating を書き換え updatedAt を進める", () => {
      const entity = ListeningLogEntity.reconstruct(baseData);
      const next = entity.rerate(5).toPlain();
      expect(next.rating).toBe(5);
      expect(next.updatedAt).not.toBe(baseData.updatedAt);
    });

    it.each([0, 6, -1, 1.5])("不正な rating（%s）は RangeError", (invalid) => {
      const entity = ListeningLogEntity.reconstruct(baseData);
      expect(() => entity.rerate(invalid)).toThrow();
    });
  });

  describe("rewriteMemo", () => {
    it("memo を新しい文字列に書き換える", () => {
      const entity = ListeningLogEntity.reconstruct(baseData);
      const next = entity.rewriteMemo("最高だった").toPlain();
      expect(next.memo).toBe("最高だった");
    });

    it("空文字も許容する（API 仕様の partial update 互換）", () => {
      const entity = ListeningLogEntity.reconstruct(baseData);
      const next = entity.rewriteMemo("").toPlain();
      expect(next.memo).toBe("");
    });
  });

  describe("correctListenedAt", () => {
    it("listenedAt を訂正する", () => {
      const entity = ListeningLogEntity.reconstruct(baseData);
      const next = entity.correctListenedAt("2024-02-01T19:00:00.000Z").toPlain();
      expect(next.listenedAt).toBe("2024-02-01T19:00:00.000Z");
      expect(next.updatedAt).not.toBe(baseData.updatedAt);
    });
  });

  describe("relinkPiece", () => {
    it("pieceId を別の楽曲に張り直す", () => {
      const entity = ListeningLogEntity.reconstruct(baseData);
      const next = entity.relinkPiece(PIECE_ID_2).toPlain();
      expect(next.pieceId).toBe(PIECE_ID_2);
      expect(next.updatedAt).not.toBe(baseData.updatedAt);
    });
  });

  describe("意図メソッドの不変条件", () => {
    it("id と createdAt はどの意図メソッドでも不変", () => {
      const entity = ListeningLogEntity.reconstruct(baseData);
      const checks = [
        entity.markAsFavorite(),
        entity.rerate(2),
        entity.rewriteMemo("x"),
        entity.correctListenedAt("2024-03-01T00:00:00.000Z"),
        entity.relinkPiece(PIECE_ID_2),
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
      const entity = ListeningLogEntity.reconstruct(baseData);
      const next = ListeningLogEntity.applyRevisions(entity, {
        isFavorite: true,
        rating: 1,
        memo: "updated",
        listenedAt: "2024-09-01T00:00:00.000Z",
        pieceId: PIECE_ID_2,
      }).toPlain();
      expect(next.isFavorite).toBe(true);
      expect(next.rating).toBe(1);
      expect(next.memo).toBe("updated");
      expect(next.listenedAt).toBe("2024-09-01T00:00:00.000Z");
      expect(next.pieceId).toBe(PIECE_ID_2);
    });

    it("undefined のフィールドは元の値を保つ（partial update）", () => {
      const entity = ListeningLogEntity.reconstruct(baseData);
      const next = ListeningLogEntity.applyRevisions(entity, { rating: 2 }).toPlain();
      expect(next.rating).toBe(2);
      expect(next.isFavorite).toBe(baseData.isFavorite);
      expect(next.memo).toBe(baseData.memo);
      expect(next.listenedAt).toBe(baseData.listenedAt);
      expect(next.pieceId).toBe(baseData.pieceId);
    });

    it("isFavorite=false は unmarkAsFavorite に dispatch する", () => {
      const entity = ListeningLogEntity.reconstruct({ ...baseData, isFavorite: true });
      const next = ListeningLogEntity.applyRevisions(entity, { isFavorite: false }).toPlain();
      expect(next.isFavorite).toBe(false);
    });

    it("空の input なら updatedAt も含めて変更されない", () => {
      const entity = ListeningLogEntity.reconstruct(baseData);
      const next = ListeningLogEntity.applyRevisions(entity, {});
      expect(next).toBe(entity);
    });
  });

  describe("isOwnedBy", () => {
    it("同じ userId なら true", () => {
      const entity = ListeningLogEntity.create(makeInput());
      expect(entity.isOwnedBy(UserId.from(USER_ID))).toBe(true);
    });

    it("異なる userId なら false", () => {
      const entity = ListeningLogEntity.create(makeInput({ userId: OTHER_USER_ID }));
      expect(entity.isOwnedBy(UserId.from(USER_ID))).toBe(false);
    });

    it("userId が null なら false", () => {
      const entity = ListeningLogEntity.create(makeInput({ userId: null }));
      expect(entity.isOwnedBy(UserId.from(USER_ID))).toBe(false);
    });
  });

  describe("sortByListenedAtDesc", () => {
    it("listenedAt 降順でソートする", () => {
      const a = ListeningLogEntity.reconstruct({
        ...baseData,
        id: "a",
        listenedAt: "2024-01-01T00:00:00.000Z",
      });
      const b = ListeningLogEntity.reconstruct({
        ...baseData,
        id: "b",
        listenedAt: "2024-12-31T00:00:00.000Z",
      });
      const sorted = ListeningLogEntity.sortByListenedAtDesc([a, b]);
      expect(sorted[0]?.id.value).toBe("b");
      expect(sorted[1]?.id.value).toBe("a");
    });
  });
});
