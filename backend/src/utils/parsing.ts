import createError, { isHttpError } from "http-errors";

export function parseRequestBody<T>(body: string): T {
  try {
    const parsed: unknown = JSON.parse(body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new createError.BadRequest("Request body must be a JSON object");
    }
    return parsed as T;
  } catch (err) {
    if (isHttpError(err)) throw err;
    throw new createError.BadRequest("Invalid JSON");
  }
}
