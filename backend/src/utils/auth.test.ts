import { describe, it, expect } from "vitest";
import type { APIGatewayProxyEvent } from "aws-lambda";
import { getUserId, getUserGroups, isAdmin, requireAdmin } from "@/utils/auth";

const makeEvent = (authorizer: unknown): APIGatewayProxyEvent =>
  ({
    requestContext: { authorizer },
  }) as unknown as APIGatewayProxyEvent;

describe("getUserId", () => {
  it("authorizer が null の場合は 401 を投げる", () => {
    expect(() => getUserId(makeEvent(null))).toThrow("User not authenticated");
  });

  it("authorizer が undefined の場合は 401 を投げる", () => {
    expect(() => getUserId(makeEvent(undefined))).toThrow("User not authenticated");
  });

  it("claims.sub が空文字の場合は 401 を投げる", () => {
    expect(() => getUserId(makeEvent({ claims: { sub: "" } }))).toThrow("User not authenticated");
  });

  it("claims.sub が undefined の場合は 401 を投げる", () => {
    expect(() => getUserId(makeEvent({ claims: {} }))).toThrow("User not authenticated");
  });

  it("有効な sub がある場合は UserId 値オブジェクトを返す", () => {
    const result = getUserId(makeEvent({ claims: { sub: "user-abc-123" } }));
    expect(result.value).toBe("user-abc-123");
  });
});

describe("getUserGroups", () => {
  it("authorizer が null の場合は空配列を返す", () => {
    expect(getUserGroups(makeEvent(null))).toEqual([]);
  });

  it("authorizer が undefined の場合は空配列を返す", () => {
    expect(getUserGroups(makeEvent(undefined))).toEqual([]);
  });

  it("cognito:groups が未定義の場合は空配列を返す", () => {
    expect(getUserGroups(makeEvent({ claims: { sub: "u" } }))).toEqual([]);
  });

  it("cognito:groups が空文字の場合は空配列を返す", () => {
    expect(getUserGroups(makeEvent({ claims: { sub: "u", "cognito:groups": "" } }))).toEqual([]);
  });

  it("cognito:groups が配列形式の場合はそのまま返す", () => {
    expect(
      getUserGroups(makeEvent({ claims: { sub: "u", "cognito:groups": ["admin", "editor"] } })),
    ).toEqual(["admin", "editor"]);
  });

  it("cognito:groups が配列の場合、文字列以外の要素は除外する", () => {
    expect(
      getUserGroups(
        makeEvent({ claims: { sub: "u", "cognito:groups": ["admin", 42, null, "editor"] } }),
      ),
    ).toEqual(["admin", "editor"]);
  });

  it("cognito:groups がカンマ区切り文字列の場合は配列に分割する", () => {
    expect(
      getUserGroups(makeEvent({ claims: { sub: "u", "cognito:groups": "admin,editor" } })),
    ).toEqual(["admin", "editor"]);
  });

  it("cognito:groups の文字列分割時に前後の空白をトリムする", () => {
    expect(
      getUserGroups(makeEvent({ claims: { sub: "u", "cognito:groups": " admin , editor " } })),
    ).toEqual(["admin", "editor"]);
  });
});

describe("isAdmin", () => {
  it("admin が含まれている場合は true を返す", () => {
    expect(isAdmin(makeEvent({ claims: { sub: "u", "cognito:groups": ["admin"] } }))).toBe(true);
  });

  it("admin がカンマ区切り文字列に含まれる場合は true を返す", () => {
    expect(isAdmin(makeEvent({ claims: { sub: "u", "cognito:groups": "editor,admin" } }))).toBe(
      true,
    );
  });

  it("admin が含まれていない場合は false を返す", () => {
    expect(isAdmin(makeEvent({ claims: { sub: "u", "cognito:groups": ["editor"] } }))).toBe(false);
  });

  it("cognito:groups が未設定の場合は false を返す", () => {
    expect(isAdmin(makeEvent({ claims: { sub: "u" } }))).toBe(false);
  });

  it("authorizer が null の場合は false を返す", () => {
    expect(isAdmin(makeEvent(null))).toBe(false);
  });
});

describe("requireAdmin", () => {
  it("admin グループに所属している場合は throw しない", () => {
    expect(() =>
      requireAdmin(makeEvent({ claims: { sub: "u", "cognito:groups": ["admin"] } })),
    ).not.toThrow();
  });

  it("admin グループに所属していない場合は 403 を投げる", () => {
    expect(() =>
      requireAdmin(makeEvent({ claims: { sub: "u", "cognito:groups": ["editor"] } })),
    ).toThrow("Admin privilege required");
  });

  it("cognito:groups が未設定の場合は 403 を投げる", () => {
    expect(() => requireAdmin(makeEvent({ claims: { sub: "u" } }))).toThrow(
      "Admin privilege required",
    );
  });

  it("authorizer が null の場合は 403 を投げる", () => {
    expect(() => requireAdmin(makeEvent(null))).toThrow("Admin privilege required");
  });
});
