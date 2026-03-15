import { describe, it, expect } from "vitest";
import type { APIGatewayProxyEvent } from "aws-lambda";
import { getIdParam } from "./path-params";

const makeEvent = (pathParameters: Record<string, string> | null): APIGatewayProxyEvent =>
  ({ pathParameters } as unknown as APIGatewayProxyEvent);

describe("getIdParam", () => {
  it("pathParameters が null の場合は 400 を投げる", () => {
    expect(() => getIdParam(makeEvent(null))).toThrow("id is required");
  });

  it("id が存在しない場合は 400 を投げる", () => {
    expect(() => getIdParam(makeEvent({}))).toThrow("id is required");
  });

  it("id が存在する場合はその値を返す", () => {
    expect(getIdParam(makeEvent({ id: "abc-123" }))).toBe("abc-123");
  });
});
