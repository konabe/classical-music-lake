import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  createListeningLogSchema,
  updateListeningLogSchema,
  createPieceSchema,
  updatePieceSchema,
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationCodeSchema,
} from "./schemas";

const fails = (result: { success: boolean }): boolean => !result.success;
const succeeds = (result: { success: boolean }): boolean => result.success;

const validLog = {
  listenedAt: "2024-01-15T19:30:00.000Z",
  composer: "ベートーヴェン",
  piece: "交響曲第9番",
  rating: 5,
  isFavorite: true,
  memo: "素晴らしい",
};

describe("createListeningLogSchema", () => {
  it("有効なデータをパースできる", () => {
    const result = createListeningLogSchema.safeParse(validLog);
    expect(result.success).toBe(true);
  });

  it("memo は省略可能", () => {
    const { memo: _memo, ...withoutMemo } = validLog;
    const result = createListeningLogSchema.safeParse(withoutMemo);
    expect(result.success).toBe(true);
  });

  it("listenedAt が ISO 8601 形式でない場合はエラー", () => {
    const result = createListeningLogSchema.safeParse({ ...validLog, listenedAt: "2024-01-15" });
    expect(result.success).toBe(false);
  });

  it("composer が空文字の場合はエラー", () => {
    const result = createListeningLogSchema.safeParse({ ...validLog, composer: "" });
    expect(result.success).toBe(false);
  });

  it("composer が空白のみの場合はエラー", () => {
    const result = createListeningLogSchema.safeParse({ ...validLog, composer: "   " });
    expect(result.success).toBe(false);
  });

  it("trim 後も 100 文字を超える composer は常にエラー", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 101, maxLength: 200 }).filter((s) => s.trim().length > 100),
        (composer) => fails(createListeningLogSchema.safeParse({ ...validLog, composer }))
      )
    );
  });

  it("piece が空文字の場合はエラー", () => {
    const result = createListeningLogSchema.safeParse({ ...validLog, piece: "" });
    expect(result.success).toBe(false);
  });

  it("trim 後も 200 文字を超える piece は常にエラー", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 201, maxLength: 400 }).filter((s) => s.trim().length > 200),
        (piece) => fails(createListeningLogSchema.safeParse({ ...validLog, piece }))
      )
    );
  });

  it("rating が 1〜5 の整数は常に有効", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 5 }), (rating) =>
        succeeds(createListeningLogSchema.safeParse({ ...validLog, rating }))
      )
    );
  });

  it("rating が 1〜5 の範囲外の整数は常にエラー", () => {
    fc.assert(
      fc.property(fc.oneof(fc.integer({ max: 0 }), fc.integer({ min: 6 })), (rating) =>
        fails(createListeningLogSchema.safeParse({ ...validLog, rating }))
      )
    );
  });

  it("rating が小数の場合は常にエラー", () => {
    fc.assert(
      fc.property(
        fc.integer().map((n) => n + 0.5),
        (rating) => fails(createListeningLogSchema.safeParse({ ...validLog, rating }))
      )
    );
  });

  it("trim 後も 1000 文字を超える memo は常にエラー", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1001, maxLength: 2000 }).filter((s) => s.trim().length > 1000),
        (memo) => fails(createListeningLogSchema.safeParse({ ...validLog, memo }))
      )
    );
  });

  it("isFavorite が boolean でない場合はエラー", () => {
    const result = createListeningLogSchema.safeParse({ ...validLog, isFavorite: "true" });
    expect(result.success).toBe(false);
  });
});

describe("updateListeningLogSchema", () => {
  it("すべてのフィールドが省略可能", () => {
    const result = updateListeningLogSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rating だけ更新できる", () => {
    const result = updateListeningLogSchema.safeParse({ rating: 3 });
    expect(result.success).toBe(true);
  });

  it("rating が範囲外の場合はエラー", () => {
    const result = updateListeningLogSchema.safeParse({ rating: 6 });
    expect(result.success).toBe(false);
  });
});

const validPiece = {
  title: "交響曲第9番",
  composer: "ベートーヴェン",
};

describe("createPieceSchema", () => {
  it("有効なデータをパースできる", () => {
    const result = createPieceSchema.safeParse(validPiece);
    expect(result.success).toBe(true);
  });

  it("videoUrl は省略可能", () => {
    const result = createPieceSchema.safeParse(validPiece);
    expect(result.success).toBe(true);
  });

  it("有効な videoUrl を受け付ける", () => {
    const result = createPieceSchema.safeParse({
      ...validPiece,
      videoUrl: "https://www.youtube.com/watch?v=abc123",
    });
    expect(result.success).toBe(true);
  });

  it("title が空文字の場合はエラー", () => {
    const result = createPieceSchema.safeParse({ ...validPiece, title: "" });
    expect(result.success).toBe(false);
  });

  it("trim 後も 200 文字を超える title は常にエラー", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 201, maxLength: 400 }).filter((s) => s.trim().length > 200),
        (title) => fails(createPieceSchema.safeParse({ ...validPiece, title }))
      )
    );
  });

  it("composer が空文字の場合はエラー", () => {
    const result = createPieceSchema.safeParse({ ...validPiece, composer: "" });
    expect(result.success).toBe(false);
  });

  it("trim 後も 100 文字を超える composer は常にエラー", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 101, maxLength: 200 }).filter((s) => s.trim().length > 100),
        (composer) => fails(createPieceSchema.safeParse({ ...validPiece, composer }))
      )
    );
  });

  it("videoUrl が無効な URL の場合はエラー", () => {
    const result = createPieceSchema.safeParse({ ...validPiece, videoUrl: "not-a-url" });
    expect(result.success).toBe(false);
  });
});

describe("updatePieceSchema", () => {
  it("すべてのフィールドが省略可能", () => {
    const result = updatePieceSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("videoUrl に空文字を渡すと削除フラグとして受け付ける", () => {
    const result = updatePieceSchema.safeParse({ videoUrl: "" });
    expect(result.success).toBe(true);
  });

  it("videoUrl に有効な URL を渡せる", () => {
    const result = updatePieceSchema.safeParse({
      videoUrl: "https://www.youtube.com/watch?v=abc",
    });
    expect(result.success).toBe(true);
  });

  it("title が空白のみの場合はエラー", () => {
    const result = updatePieceSchema.safeParse({ title: "   " });
    expect(result.success).toBe(false);
  });
});

const validAuth = {
  email: "user@example.com",
  password: "SecurePass1",
};

describe("registerSchema", () => {
  it("有効なデータをパースできる", () => {
    const result = registerSchema.safeParse(validAuth);
    expect(result.success).toBe(true);
  });

  it("email が無効な場合はエラー", () => {
    const result = registerSchema.safeParse({ ...validAuth, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("8 文字未満の password は常にエラー", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 7 }), (password) =>
        fails(registerSchema.safeParse({ ...validAuth, password }))
      )
    );
  });

  it("大文字を含まない password は常にエラー", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 8 }).filter((s) => !/[A-Z]/.test(s)),
        (password) => fails(registerSchema.safeParse({ ...validAuth, password }))
      )
    );
  });

  it("小文字を含まない password は常にエラー", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 8 }).filter((s) => !/[a-z]/.test(s)),
        (password) => fails(registerSchema.safeParse({ ...validAuth, password }))
      )
    );
  });

  it("数字を含まない password は常にエラー", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 8 }).filter((s) => !/\d/.test(s)),
        (password) => fails(registerSchema.safeParse({ ...validAuth, password }))
      )
    );
  });
});

describe("loginSchema", () => {
  it("有効なデータをパースできる", () => {
    const result = loginSchema.safeParse(validAuth);
    expect(result.success).toBe(true);
  });

  it("password に複雑さルールは適用されない（1文字以上であればOK）", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "simple" });
    expect(result.success).toBe(true);
  });

  it("password が空文字の場合はエラー", () => {
    const result = loginSchema.safeParse({ ...validAuth, password: "" });
    expect(result.success).toBe(false);
  });

  it("email が未設定の場合はエラー", () => {
    const result = loginSchema.safeParse({ password: "pass123" });
    expect(result.success).toBe(false);
  });
});

describe("verifyEmailSchema", () => {
  it("有効なデータをパースできる", () => {
    const result = verifyEmailSchema.safeParse({ email: "user@example.com", code: "123456" });
    expect(result.success).toBe(true);
  });

  it("code が空文字の場合はエラー", () => {
    const result = verifyEmailSchema.safeParse({ email: "user@example.com", code: "" });
    expect(result.success).toBe(false);
  });

  it("email が無効な場合はエラー", () => {
    const result = verifyEmailSchema.safeParse({ email: "invalid", code: "123456" });
    expect(result.success).toBe(false);
  });
});

describe("resendVerificationCodeSchema", () => {
  it("有効なメールアドレスをパースできる", () => {
    const result = resendVerificationCodeSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("email が無効な場合はエラー", () => {
    const result = resendVerificationCodeSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("email が未設定の場合はエラー", () => {
    const result = resendVerificationCodeSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
