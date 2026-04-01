import createError from "http-errors";
import type { ZodType } from "zod";

export function parseRequestBody<T>(body: unknown, schema?: ZodType<T>): T {
  if (body === null || body === undefined) {
    throw new createError.BadRequest("Request body is required");
  }
  if (typeof body !== "object" || Array.isArray(body)) {
    throw new createError.BadRequest("Request body must be a JSON object");
  }
  if (schema !== undefined) {
    const result = schema.safeParse(body);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- SafeParseReturnType の success が any として解決される環境があるため明示比較が必要
    if (result.success === false) {
      throw new createError.BadRequest(result.error.issues[0].message);
    }
    return result.data;
  }
  return body as T;
}
