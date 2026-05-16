import { describe, it, expect } from "vitest";
import type { APIGatewayProxyEvent } from "aws-lambda";
import { getIdParam } from "@/utils/path-params";
import { PieceId } from "@/domain/value-objects/ids";

const makeEvent = (pathParameters: Record<string, string> | null): APIGatewayProxyEvent =>
  ({ pathParameters }) as unknown as APIGatewayProxyEvent;

const identity = (value: string): string => value;

describe("getIdParam", () => {
  it("pathParameters が null の場合は 400 を投げる", () => {
    expect(() => getIdParam(makeEvent(null), identity)).toThrow("id is required");
  });

  it("id が存在しない場合は 400 を投げる", () => {
    expect(() => getIdParam(makeEvent({}), identity)).toThrow("id is required");
  });

  it("id が存在する場合は factory が返す値を返す", () => {
    expect(getIdParam(makeEvent({ id: "abc-123" }), identity)).toBe("abc-123");
  });

  it("factory に ID 値オブジェクトの生成関数を渡すと VO を返す", () => {
    const id = getIdParam(makeEvent({ id: "abc-123" }), PieceId.from);
    expect(id).toBeInstanceOf(PieceId);
    expect(id.value).toBe("abc-123");
  });
});
