import { toSelectOptions } from "@/utils/select-options";

describe("toSelectOptions", () => {
  it("文字列配列を { value, label } 配列に変換する", () => {
    const result = toSelectOptions(["A", "B"] as const);
    expect(result).toEqual([
      { value: "A", label: "A" },
      { value: "B", label: "B" },
    ]);
  });

  it("空配列を渡すと空配列を返す", () => {
    const result = toSelectOptions([] as const);
    expect(result).toEqual([]);
  });

  it("日本語文字列でも value と label が同じ値になる", () => {
    const result = toSelectOptions(["古典派", "ロマン派"] as const);
    expect(result).toEqual([
      { value: "古典派", label: "古典派" },
      { value: "ロマン派", label: "ロマン派" },
    ]);
  });
});
