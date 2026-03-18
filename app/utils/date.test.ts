import { describe, it, expect } from "vitest";
import { formatDate, formatDatetime, toDatetimeLocal, nowAsDatetimeLocal } from "./date";

describe("formatDate", () => {
  it("ISO 8601 文字列から日付部分（YYYY-MM-DD）のみを返す", () => {
    expect(formatDate("2024-03-15T10:30:00.000Z")).toBe("2024-03-15");
  });

  it("時刻情報が異なっても日付部分のみを返す", () => {
    expect(formatDate("2024-12-31T23:59:59.999Z")).toBe("2024-12-31");
  });
});

describe("formatDatetime", () => {
  it("T を空白に置換し、分までの文字列を返す", () => {
    expect(formatDatetime("2024-03-15T10:30:00.000Z")).toBe("2024-03-15 10:30");
  });

  it("秒・ミリ秒を切り捨てる", () => {
    expect(formatDatetime("2024-12-31T23:59:59.999Z")).toBe("2024-12-31 23:59");
  });
});

describe("toDatetimeLocal", () => {
  it("datetime-local input 用に YYYY-MM-DDTHH:mm 形式を返す", () => {
    expect(toDatetimeLocal("2024-03-15T10:30:00.000Z")).toBe("2024-03-15T10:30");
  });

  it("秒以降を切り捨てる", () => {
    expect(toDatetimeLocal("2024-12-31T23:59:59.999Z")).toBe("2024-12-31T23:59");
  });
});

describe("nowAsDatetimeLocal", () => {
  it("YYYY-MM-DDTHH:mm 形式の文字列を返す", () => {
    const result = nowAsDatetimeLocal();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it("現在時刻に近い値を返す", () => {
    const before = new Date();
    const result = nowAsDatetimeLocal();
    const after = new Date();

    const resultDate = new Date(result);
    expect(resultDate.getTime()).toBeGreaterThanOrEqual(before.getTime() - 60000);
    expect(resultDate.getTime()).toBeLessThanOrEqual(after.getTime() + 60000);
  });
});
