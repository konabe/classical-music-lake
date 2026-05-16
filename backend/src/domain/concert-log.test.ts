import { describe, it, expect } from "vitest";

import { ConcertLogEntity } from "@/domain/concert-log";
import { UserId } from "@/domain/value-objects/ids";
import type { ConcertLog, CreateConcertLogInput } from "@/types";

const USER_ID = "cognito-sub-user-1";
const OTHER_USER_ID = "cognito-sub-user-2";
const PIECE_ID_1 = "00000000-0000-4000-8000-000000000001";
const PIECE_ID_2 = "00000000-0000-4000-8000-000000000002";

const makeInput = (overrides: Partial<CreateConcertLogInput> = {}): CreateConcertLogInput => ({
  title: "定期演奏会 第100回",
  concertDate: "2024-01-15T19:00:00.000Z",
  venue: "サントリーホール",
  ...overrides,
});

const baseData: ConcertLog = {
  id: "cl-1",
  userId: USER_ID,
  title: "定期演奏会 第100回",
  concertDate: "2024-01-15T19:00:00.000Z",
  venue: "サントリーホール",
  conductor: "小澤征爾",
  createdAt: "2024-01-15T21:00:00.000Z",
  updatedAt: "2024-01-15T21:00:00.000Z",
};

describe("ConcertLogEntity", () => {
  it("create で id・createdAt・updatedAt が付与される", () => {
    const entity = ConcertLogEntity.create(makeInput(), UserId.from(USER_ID));
    const plain = entity.toPlain();
    expect(plain.id).toBeDefined();
    expect(plain.userId).toBe(USER_ID);
    expect(plain.createdAt).toBeDefined();
    expect(plain.updatedAt).toBeDefined();
    expect(plain.title).toBe("定期演奏会 第100回");
    expect(plain.venue).toBe("サントリーホール");
  });

  it("reconstruct は与えた id / createdAt / updatedAt を保持する", () => {
    const entity = ConcertLogEntity.reconstruct(baseData);
    const plain = entity.toPlain();
    expect(plain.id).toBe("cl-1");
    expect(plain.createdAt).toBe(baseData.createdAt);
    expect(plain.updatedAt).toBe(baseData.updatedAt);
  });

  describe("revise（鑑賞記録の訂正）", () => {
    it("指定したフィールドのみ書き換え、updatedAt を進める", () => {
      const entity = ConcertLogEntity.reconstruct(baseData);
      const revised = entity.revise({ venue: "東京文化会館" }).toPlain();
      expect(revised.venue).toBe("東京文化会館");
      expect(revised.title).toBe(baseData.title);
      expect(revised.concertDate).toBe(baseData.concertDate);
      expect(revised.conductor).toBe(baseData.conductor);
      expect(revised.updatedAt).not.toBe(baseData.updatedAt);
    });

    it("複数フィールドをまとめて書き換えられる", () => {
      const entity = ConcertLogEntity.reconstruct(baseData);
      const revised = entity
        .revise({
          title: "特別演奏会",
          venue: "東京文化会館",
          conductor: "カラヤン",
        })
        .toPlain();
      expect(revised.title).toBe("特別演奏会");
      expect(revised.venue).toBe("東京文化会館");
      expect(revised.conductor).toBe("カラヤン");
    });

    it("id と createdAt は不変", () => {
      const entity = ConcertLogEntity.reconstruct(baseData);
      const revised = entity.revise({ venue: "東京文化会館" }).toPlain();
      expect(revised.id).toBe(baseData.id);
      expect(revised.createdAt).toBe(baseData.createdAt);
    });

    it("pieceIds を配列で書き換えられる", () => {
      const entity = ConcertLogEntity.reconstruct(baseData);
      const revised = entity.revise({ pieceIds: [PIECE_ID_1, PIECE_ID_2] }).toPlain();
      expect(revised.pieceIds).toEqual([PIECE_ID_1, PIECE_ID_2]);
    });

    it("pieceIds に空配列を渡すとプログラムが空になる", () => {
      const entity = ConcertLogEntity.reconstruct({ ...baseData, pieceIds: [PIECE_ID_1] });
      const revised = entity.revise({ pieceIds: [] }).toPlain();
      expect(revised.pieceIds).toEqual([]);
    });

    it("イミュータブル（元エンティティは変化しない）", () => {
      const entity = ConcertLogEntity.reconstruct(baseData);
      entity.revise({ venue: "東京文化会館" });
      expect(entity.toPlain().venue).toBe(baseData.venue);
    });
  });

  describe("isOwnedBy", () => {
    it("同じ userId なら true", () => {
      const entity = ConcertLogEntity.create(makeInput(), UserId.from(USER_ID));
      expect(entity.isOwnedBy(UserId.from(USER_ID))).toBe(true);
    });

    it("異なる userId なら false", () => {
      const entity = ConcertLogEntity.create(makeInput(), UserId.from(OTHER_USER_ID));
      expect(entity.isOwnedBy(UserId.from(USER_ID))).toBe(false);
    });
  });

  describe("sortByConcertDateDesc", () => {
    it("concertDate 降順でソートする", () => {
      const a = ConcertLogEntity.reconstruct({
        id: "a",
        userId: USER_ID,
        title: "A",
        concertDate: "2024-01-01T00:00:00.000Z",
        venue: "V",
        createdAt: "x",
        updatedAt: "x",
      });
      const b = ConcertLogEntity.reconstruct({
        id: "b",
        userId: USER_ID,
        title: "B",
        concertDate: "2024-12-31T00:00:00.000Z",
        venue: "V",
        createdAt: "x",
        updatedAt: "x",
      });
      const sorted = ConcertLogEntity.sortByConcertDateDesc([a, b]);
      expect(sorted[0]?.id.value).toBe("b");
      expect(sorted[1]?.id.value).toBe("a");
    });
  });
});
