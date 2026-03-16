import createError from "http-errors";
import type { ZodType } from "zod";

export function parseBody<T>(body: unknown, schema: ZodType<T>): T {
  if (body === null || body === undefined) {
    throw new createError.BadRequest("Request body is required");
  }
  if (typeof body !== "object" || Array.isArray(body)) {
    throw new createError.BadRequest("Request body must be a JSON object");
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw new createError.BadRequest(result.error.issues[0]?.message ?? "Invalid request body");
  }
  return result.data;
}
