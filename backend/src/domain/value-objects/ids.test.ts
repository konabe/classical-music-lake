import { describe, it, expect } from "vitest";

import {
  ComposerId,
  ConcertLogId,
  ListeningLogId,
  PieceId,
  UserId,
} from "@/domain/value-objects/ids";

describe("IdValueObject", () => {
  describe("生成と値参照", () => {
    it.each([ListeningLogId, ConcertLogId, PieceId, ComposerId] as const)(
      "%s.generate() は UUID を保持する値オブジェクトを返す",
      (Ctor) => {
        const id = Ctor.generate();
        expect(id.value).toBeUUID();
        expect(String(id)).toBe(id.value);
      },
    );

    it.each([ListeningLogId, ConcertLogId, PieceId, ComposerId, UserId] as const)(
      "%s.from() は与えた文字列をそのまま保持する",
      (Ctor) => {
        const id = Ctor.from("abc-123");
        expect(id.value).toBe("abc-123");
      },
    );

    it.each([ListeningLogId, ConcertLogId, PieceId, ComposerId, UserId] as const)(
      "%s.from() は空文字列を拒否する",
      (Ctor) => {
        expect(() => Ctor.from("")).toThrow(TypeError);
      },
    );

    it.each([ListeningLogId, ConcertLogId, PieceId, ComposerId, UserId] as const)(
      "%s.from() は非文字列を拒否する",
      (Ctor) => {
        // 型検査をすり抜けて渡された場合の防御
        expect(() => Ctor.from(undefined as unknown as string)).toThrow(TypeError);
        expect(() => Ctor.from(null as unknown as string)).toThrow(TypeError);
        expect(() => Ctor.from(123 as unknown as string)).toThrow(TypeError);
      },
    );
  });

  describe("equals", () => {
    it("同じクラス・同じ値の VO は等しい", () => {
      const a = ListeningLogId.from("abc-123");
      const b = ListeningLogId.from("abc-123");
      expect(a.equals(b)).toBe(true);
    });

    it("同じクラスでも値が異なれば等しくない", () => {
      const a = ListeningLogId.from("abc-123");
      const b = ListeningLogId.from("xyz-456");
      expect(a.equals(b)).toBe(false);
    });

    it("値が同じでもクラスが違えば等しくない（ID 取り違え検出）", () => {
      const log = ListeningLogId.from("abc-123");
      const piece = PieceId.from("abc-123");
      // 型システムで弾かれるがランタイムでも取り違えを検出する
      expect(log.equals(piece as unknown as ListeningLogId)).toBe(false);
    });
  });

  describe("generate で得られる ID はユニーク", () => {
    it("連続生成した UUID は重複しない", () => {
      const a = PieceId.generate();
      const b = PieceId.generate();
      expect(a.value).not.toBe(b.value);
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("UserId", () => {
    it("generate は定義されない（外部 IdP 発行のため）", () => {
      expect((UserId as unknown as { generate?: () => UserId }).generate).toBeUndefined();
    });
  });
});
