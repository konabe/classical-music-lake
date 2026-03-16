import createError from "http-errors";
import { z } from "zod";

export function parseRequestBody<T>(body: unknown, schema?: z.ZodType<T>): T {
  if (body === null || body === undefined) {
    throw new createError.BadRequest("Request body is required");
  }
  if (typeof body !== "object" || Array.isArray(body)) {
    throw new createError.BadRequest("Request body must be a JSON object");
  }
  if (schema) {
    const result = schema.safeParse(body);
    if (!result.success) {
      throw new createError.BadRequest(result.error.issues[0].message);
    }
    return result.data;
  }
  return body as T;
}
