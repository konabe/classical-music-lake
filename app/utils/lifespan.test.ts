import { formatLifespan } from "@/utils/lifespan";

describe("formatLifespan", () => {
  it("両方未指定なら空文字を返す", () => {
    expect(formatLifespan(undefined, undefined)).toBe("");
  });

  it("生年と没年が両方ある場合は en dash で連結する", () => {
    expect(formatLifespan(1770, 1827)).toBe("1770–1827");
  });

  it("生年のみの場合は没年側を空にする", () => {
    expect(formatLifespan(1958, undefined)).toBe("1958–");
  });

  it("没年のみの場合は生年側を空にする", () => {
    expect(formatLifespan(undefined, 1827)).toBe("–1827");
  });

  it("負数（紀元前）は BC 表記にする", () => {
    expect(formatLifespan(-750, -680)).toBe("750 BC–680 BC");
  });
});
