import { describe, it, expect } from "vitest";

import { ConcertLogEntity } from "./concert-log";
import { UserId } from "./value-objects/ids";
import type { ConcertLog, CreateConcertLogInput } from "../types";

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
    const data: ConcertLog = {
      id: "cl-abc",
      userId: USER_ID,
      title: "特別演奏会",
      concertDate: "2024-03-01T19:00:00.000Z",
      venue: "東京文化会館",
      createdAt: "2024-03-01T20:00:00.000Z",
      updatedAt: "2024-03-01T20:00:00.000Z",
    };
    const entity = ConcertLogEntity.reconstruct(data);
    const plain = entity.toPlain();
    expect(plain.id).toBe("cl-abc");
    expect(plain.createdAt).toBe(data.createdAt);
    expect(plain.updatedAt).toBe(data.updatedAt);
  });

  describe("mergeUpdate", () => {
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

    it("指定フィールドのみ上書きし、updatedAt を進める", () => {
      const entity = ConcertLogEntity.reconstruct(baseData);
      const updated = entity.mergeUpdate({ venue: "東京文化会館" }).toPlain();
      expect(updated.venue).toBe("東京文化会館");
      expect(updated.title).toBe(baseData.title);
      expect(updated.concertDate).toBe(baseData.concertDate);
      expect(updated.conductor).toBe(baseData.conductor);
      expect(updated.updatedAt).not.toBe(baseData.updatedAt);
    });

    it("id と createdAt は不変", () => {
      const entity = ConcertLogEntity.reconstruct(baseData);
      const updated = entity.mergeUpdate({ venue: "東京文化会館" }).toPlain();
      expect(updated.id).toBe(baseData.id);
      expect(updated.createdAt).toBe(baseData.createdAt);
    });

    it("pieceIds を配列で更新できる", () => {
      const entity = ConcertLogEntity.reconstruct(baseData);
      const updated = entity.mergeUpdate({ pieceIds: [PIECE_ID_1, PIECE_ID_2] }).toPlain();
      expect(updated.pieceIds).toEqual([PIECE_ID_1, PIECE_ID_2]);
    });

    it("pieceIds を空配列で送ると空配列のまま保持される（プログラムを空に）", () => {
      const entity = ConcertLogEntity.reconstruct({
        ...baseData,
        pieceIds: [PIECE_ID_1],
      });
      const updated = entity.mergeUpdate({ pieceIds: [] }).toPlain();
      expect(updated.pieceIds).toEqual([]);
    });
  });

  describe("isOwnedBy", () => {
    it("同じ userId なら true", () => {
      const entity = ConcertLogEntity.create(makeInput(), UserId.from(USER_ID));
      expect(entity.isOwnedBy(UserId.from(USER_ID))).toBe(true);
    });

    it("異なる userId なら false", () => {
      const entity = ConcertLogEntity.create(makeInput(), UserId.from(USER_ID));
      expect(entity.isOwnedBy(UserId.from(OTHER_USER_ID))).toBe(false);
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
