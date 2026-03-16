import createError from "http-errors";
import type { ZodType } from "zod";

export function parseBody<T>(body: string | null, schema: ZodType<T>): T {
  if (!body) throw new createError.BadRequest("Request body is required");

  let raw: unknown;
  try {
    raw = JSON.parse(body);
  } catch {
    throw new createError.BadRequest("Invalid JSON");
  }

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new createError.BadRequest("Request body must be a JSON object");
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new createError.BadRequest(result.error.issues[0]?.message ?? "Invalid request body");
  }
  return result.data;
}
