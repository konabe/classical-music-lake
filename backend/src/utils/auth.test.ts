import { describe, it, expect } from "vitest";
import type { APIGatewayProxyEvent } from "aws-lambda";
import { getUserId } from "./auth";

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

  it("有効な sub がある場合はその値を返す", () => {
    const result = getUserId(makeEvent({ claims: { sub: "user-abc-123" } }));
    expect(result).toBe("user-abc-123");
  });
});
