import { describe, it, expect } from "vitest";

import { ConcertLogEntity } from "./concert-log";
import { ConcertTitle } from "./value-objects/concert-title";
import { PieceId, UserId } from "./value-objects/ids";
import { Venue } from "./value-objects/venue";
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

  describe("意図メソッドは新エンティティを返し updatedAt を進める", () => {
    it("rename はタイトルだけを置き換える", () => {
      const entity = ConcertLogEntity.reconstruct(baseData);
      const renamed = entity.rename(ConcertTitle.of("特別演奏会")).toPlain();
      expect(renamed.title).toBe("特別演奏会");
      expect(renamed.venue).toBe(baseData.venue);
      expect(renamed.concertDate).toBe(baseData.concertDate);
      expect(renamed.id).toBe(baseData.id);
      expect(renamed.createdAt).toBe(baseData.createdAt);
      expect(renamed.updatedAt).not.toBe(baseData.updatedAt);
    });

    it("relocate は会場だけを置き換える", () => {
      const entity = ConcertLogEntity.reconstruct(baseData);
      const moved = entity.relocate(Venue.of("東京文化会館")).toPlain();
      expect(moved.venue).toBe("東京文化会館");
      expect(moved.title).toBe(baseData.title);
      expect(moved.updatedAt).not.toBe(baseData.updatedAt);
    });

    it("reschedule は開催日時だけを置き換える", () => {
      const entity = ConcertLogEntity.reconstruct(baseData);
      const rescheduled = entity.reschedule("2024-03-01T19:00:00.000Z").toPlain();
      expect(rescheduled.concertDate).toBe("2024-03-01T19:00:00.000Z");
      expect(rescheduled.title).toBe(baseData.title);
      expect(rescheduled.updatedAt).not.toBe(baseData.updatedAt);
    });

    it("assignConductor は指揮者だけを置き換える", () => {
      const entity = ConcertLogEntity.reconstruct(baseData);
      const reassigned = entity.assignConductor("カラヤン").toPlain();
      expect(reassigned.conductor).toBe("カラヤン");
      expect(reassigned.orchestra).toBeUndefined();
      expect(reassigned.updatedAt).not.toBe(baseData.updatedAt);
    });

    it("assignOrchestra はオーケストラだけを置き換える", () => {
      const entity = ConcertLogEntity.reconstruct(baseData);
      const reassigned = entity.assignOrchestra("ベルリン・フィル").toPlain();
      expect(reassigned.orchestra).toBe("ベルリン・フィル");
      expect(reassigned.conductor).toBe(baseData.conductor);
    });

    it("assignSoloist はソリストだけを置き換える", () => {
      const entity = ConcertLogEntity.reconstruct(baseData);
      const reassigned = entity.assignSoloist("内田光子").toPlain();
      expect(reassigned.soloist).toBe("内田光子");
    });

    it("setProgram はプログラム配列を置き換える", () => {
      const entity = ConcertLogEntity.reconstruct(baseData);
      const programmed = entity
        .setProgram([PieceId.from(PIECE_ID_1), PieceId.from(PIECE_ID_2)])
        .toPlain();
      expect(programmed.pieceIds).toEqual([PIECE_ID_1, PIECE_ID_2]);
    });

    it("setProgram に空配列を渡すとプログラムが空になる", () => {
      const entity = ConcertLogEntity.reconstruct({ ...baseData, pieceIds: [PIECE_ID_1] });
      const cleared = entity.setProgram([]).toPlain();
      expect(cleared.pieceIds).toEqual([]);
    });

    it("意図メソッドはイミュータブル（元エンティティは変化しない）", () => {
      const entity = ConcertLogEntity.reconstruct(baseData);
      entity.rename(ConcertTitle.of("別の名前"));
      expect(entity.toPlain().title).toBe(baseData.title);
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
